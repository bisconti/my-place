/*
  file: api.ts
  description
  - 공통 API 클라이언트와 access token 자동 부착, 401 발생 시 refresh cookie 기반 토큰 재발급을 담당하는 파일
*/
import axios from "axios";
import type { AxiosError, AxiosRequestConfig, AxiosRequestHeaders } from "axios";
import { authStorage } from "../stores/authStorage";
import { isDuringBoot, runOnUnauthorized, useAuthStore } from "../stores/authStore";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "",
  withCredentials: true,
});

type RetryableRequestConfig = AxiosRequestConfig & { _retry?: boolean };

let isUnauthorizedHandling = false;

const safeRunOnUnauthorized = ({ silent }: { silent: boolean }) => {
  authStorage.clearAllAuth();

  if (isUnauthorizedHandling) return;
  isUnauthorizedHandling = true;

  runOnUnauthorized({ silent });
};

const getAuthorizationHeader = (headers?: AxiosRequestHeaders | Record<string, unknown>) => {
  if (!headers) return undefined;

  const authHeader =
    typeof (headers as AxiosRequestHeaders).Authorization === "string"
      ? (headers as AxiosRequestHeaders).Authorization
      : typeof (headers as Record<string, unknown>).authorization === "string"
        ? ((headers as Record<string, unknown>).authorization as string)
        : undefined;

  return authHeader;
};

api.interceptors.request.use((config) => {
  const token = authStorage.getAccessToken();
  if (!token) return config;

  config.headers = (config.headers ?? {}) as AxiosRequestHeaders;

  const existingAuth = getAuthorizationHeader(config.headers as AxiosRequestHeaders);
  if (!existingAuth) {
    (config.headers as AxiosRequestHeaders).Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => {
    const headers = response.config.headers as AxiosRequestHeaders | undefined;
    const hasAuthHeader = typeof getAuthorizationHeader(headers) === "string";

    if (hasAuthHeader) {
      authStorage.setHadAuthSession();
      isUnauthorizedHandling = false;
    }

    return response;
  },
  async (error: AxiosError) => {
    const status = error?.response?.status;
    const original = (error.config ?? {}) as RetryableRequestConfig;
    const url = original?.url ?? "";
    const hadAuthSession = authStorage.getHadAuthSession();
    const silent = isDuringBoot() || !hadAuthSession;

    if (status !== 401) {
      if (status === 403) {
        safeRunOnUnauthorized({ silent });
      }

      return Promise.reject(error);
    }

    return handle401(error, original, silent, url);
  }
);

let refreshPromise: Promise<string> | null = null;

const requestRefresh = async (): Promise<string> => {
  const response = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL ?? ""}/auth/refresh`,
    undefined,
    { withCredentials: true }
  );

  const newAccessToken = response.data?.accessToken;
  if (!newAccessToken) {
    throw new Error("no accessToken in refresh response");
  }

  useAuthStore.getState().setAccessToken(newAccessToken);
  authStorage.setHadAuthSession();
  isUnauthorizedHandling = false;

  return newAccessToken;
};

const setAuthHeader = (config: AxiosRequestConfig, token: string) => {
  config.headers = (config.headers ?? {}) as AxiosRequestHeaders;
  (config.headers as AxiosRequestHeaders).Authorization = `Bearer ${token}`;
};

const handle401 = async (
  error: AxiosError,
  original: RetryableRequestConfig,
  silent: boolean,
  url: string
) => {
  if (url.includes("/auth/refresh")) {
    safeRunOnUnauthorized({ silent });
    return Promise.reject(error);
  }

  if (original?._retry) {
    safeRunOnUnauthorized({ silent });
    return Promise.reject(error);
  }

  original._retry = true;

  try {
    if (!refreshPromise) {
      refreshPromise = requestRefresh().finally(() => {
        refreshPromise = null;
      });
    }

    const newToken = await refreshPromise;
    setAuthHeader(original, newToken);
    return api.request(original);
  } catch {
    safeRunOnUnauthorized({ silent });
    return Promise.reject(error);
  }
};
