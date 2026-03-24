/*
  파일명: api.ts
  기능 
  - API Client(인증이 필요한 API 요청들 관리)
  - access token 만료 시 refresh token으로 새로운 access token 발급하여 자동 로그인 연장 처리
  - Authorization header 붙이기
  - 401 발생 시 refresh 한번 호출 후 나머지 api 요청은 큐에 대기시키는 토큰 재발급 동시성 제어 처리
  - refresh 성공 시 원래 요청 재시도, 실패 시 로그아웃
  - 강제 및 silent 로그아웃 구분하여 처리
*/
import axios from "axios";
import type { AxiosError, AxiosRequestConfig, AxiosRequestHeaders } from "axios";
import { authStorage } from "../stores/authStorage";
import { isDuringBoot, runOnUnauthorized, useAuthStore } from "../stores/authStore";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "",
});

type RetryableRequestConfig = AxiosRequestConfig & { _retry?: boolean };

// 로그아웃 중복 실행 방지
let isUnauthorizedHandling = false;

// runOnUnauthorized 중복 호출 방지용 래퍼
const safeRunOnUnauthorized = ({ silent }: { silent: boolean }) => {
  authStorage.clearAllAuth();

  if (isUnauthorizedHandling) return;
  isUnauthorizedHandling = true;

  runOnUnauthorized({ silent });
};

// Authorization 헤더 읽기 유틸
const getAuthorizationHeader = (headers?: AxiosRequestHeaders | Record<string, unknown>) => {
  if (!headers) return undefined;

  const authHeader =
    typeof (headers as AxiosRequestHeaders).Authorization === "string"
      ? (headers as AxiosRequestHeaders).Authorization
      : typeof (headers as Record<string, unknown>)["authorization"] === "string"
        ? ((headers as Record<string, unknown>)["authorization"] as string)
        : undefined;

  return authHeader;
};

// api 요청 시 header에 Authorization 붙이기
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

// 인증 헤더가 붙은 요청이 성공하면, 이 탭에서 인증이 실제로 성공했음을 기록
api.interceptors.response.use(
  (res) => {
    const headers = res.config.headers as AxiosRequestHeaders | undefined;
    const hasAuthHeader = typeof getAuthorizationHeader(headers) === "string";

    if (hasAuthHeader) {
      authStorage.setHadAuthSession();
      isUnauthorizedHandling = false;
    }
    return res;
  },
  async (error: AxiosError) => {
    const status = error?.response?.status;
    const original = (error.config ?? {}) as RetryableRequestConfig;

    const url = original?.url ?? "";
    const hadAuthSession = authStorage.getHadAuthSession();
    const silent = isDuringBoot() || !hadAuthSession;

    console.log("[API 401 DEBUG]", {
      status,
      url,
      silent,
      hadAuthSession,
      duringBoot: isDuringBoot(),
      hasToken: !!authStorage.getAccessToken(),
      hasRefreshToken: !!authStorage.getRefreshToken(),
      retry: original?._retry,
    });

    if (status !== 401) {
      if (status === 403) {
        console.log("[API runOnUnauthorized]", { url, status, silent });
        safeRunOnUnauthorized({ silent });
      }
      return Promise.reject(error);
    }

    return handle401(error, original, silent);
  }
);

/* =====================================================================================================================
 *                                              refresh token 기능 시작
 * =====================================================================================================================
 */
let refreshPromise: Promise<string> | null = null;

const requestRefresh = async (): Promise<string> => {
  const refreshToken = authStorage.getRefreshToken();
  if (!refreshToken) throw new Error("no refreshToken");

  const res = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL ?? ""}/auth/refresh`,
    { refreshToken },
    { withCredentials: true }
  );

  const newAccessToken = res.data?.accessToken;
  if (!newAccessToken) throw new Error("no accessToken in refresh response");

  const newRefreshToken = res.data?.refreshToken;

  useAuthStore.getState().setAccessToken(newAccessToken);

  if (newRefreshToken) {
    useAuthStore.getState().setRefreshToken(newRefreshToken);
  }

  authStorage.setHadAuthSession();
  isUnauthorizedHandling = false;

  return newAccessToken;
};

const setAuthHeader = (config: AxiosRequestConfig, token: string) => {
  config.headers = (config.headers ?? {}) as AxiosRequestHeaders;
  (config.headers as AxiosRequestHeaders).Authorization = `Bearer ${token}`;
};

const handle401 = async (error: AxiosError, original: RetryableRequestConfig, silent: boolean) => {
  const url = original?.url ?? "";

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
  } catch (e) {
    console.error(e);
    safeRunOnUnauthorized({ silent });
    return Promise.reject(error);
  }
};
/* =====================================================================================================================
 *                                              refresh token 기능 끝
 * =====================================================================================================================
 */
