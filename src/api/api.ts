import axios from "axios";
import type { AxiosError, AxiosRequestConfig, AxiosRequestHeaders } from "axios";
import { isDuringBoot, runOnUnauthorized } from "../stores/authStore";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "",
  // withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 인증 헤더가 붙은 요청이 "성공"하면, 이 탭에서 인증이 실제로 성공했음을 기록
api.interceptors.response.use(
  (res) => {
    const headers = res.config.headers as AxiosRequestHeaders | undefined;

    const hasAuthHeader =
      !!headers &&
      (typeof headers.Authorization === "string" ||
        typeof (headers as Record<string, unknown>)["authorization"] === "string");

    if (hasAuthHeader) {
      sessionStorage.setItem("hadAuthSession", "1");
    }
    return res;
  },
  async (error: AxiosError) => {
    const status = error?.response?.status;
    const original = (error.config ?? {}) as AxiosRequestConfig & { _retry?: boolean };

    const url = original?.url ?? "";
    const hadAuthSession = sessionStorage.getItem("hadAuthSession") === "1";
    const silent = isDuringBoot() || !hadAuthSession;

    console.log("[API 401 DEBUG]", {
      status,
      url,
      silent,
      hadAuthSession,
      duringBoot: isDuringBoot(),
      hasToken: !!localStorage.getItem("token"),
      hasRefreshToken: !!localStorage.getItem("refreshToken"),
      retry: original?._retry,
    });

    if (status !== 401) {
      if (status === 403) {
        console.log("[API runOnUnauthorized]", { url, status, silent });
        runOnUnauthorized({ silent });
      }
      return Promise.reject(error);
    }

    return handle401(error, original, silent);
  }
);

// ---- refresh 동시성 제어 ----
let isRefreshing = false;
let refreshQueue: Array<(token: string | null) => void> = [];

const enqueue = (cb: (token: string | null) => void) => refreshQueue.push(cb);
const flushQueue = (token: string | null) => {
  refreshQueue.forEach((cb) => cb(token));
  refreshQueue = [];
};

// refresh 요청
const requestRefresh = async (): Promise<string> => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) throw new Error("no refreshToken");

  const res = await axios.post(
    `${import.meta.env.VITE_API_BASE_URL ?? ""}/auth/refresh`,
    { refreshToken },
    { withCredentials: true }
  );

  const newAccessToken = res.data?.accessToken;
  if (!newAccessToken) throw new Error("no accessToken in refresh response");

  const newRefreshToken = res.data?.refreshToken;
  if (newRefreshToken) localStorage.setItem("refreshToken", newRefreshToken);

  localStorage.setItem("token", newAccessToken);

  // refresh 성공 자체가 "이 탭에서 인증 성공"이므로 기록
  sessionStorage.setItem("hadAuthSession", "1");

  return newAccessToken;
};

// 헤더 세팅 헬퍼
const setAuthHeader = (config: AxiosRequestConfig, token: string) => {
  config.headers = (config.headers ?? {}) as AxiosRequestHeaders;
  (config.headers as AxiosRequestHeaders)["Authorization"] = `Bearer ${token}`;
};

const handle401 = async (error: AxiosError, original: AxiosRequestConfig & { _retry?: boolean }, silent: boolean) => {
  // refresh 엔드포인트에서 401이면 즉시 로그아웃
  const url = original?.url ?? "";
  if (url.includes("/auth/refresh")) {
    runOnUnauthorized({ silent });
    return Promise.reject(error);
  }

  // 무한루프 방지
  if (original?._retry) {
    runOnUnauthorized({ silent });
    return Promise.reject(error);
  }
  original._retry = true;

  // 이미 refresh 중이면 대기했다가 토큰 받으면 재시도
  if (isRefreshing) {
    return new Promise((resolve, reject) => {
      enqueue((token) => {
        if (!token) {
          runOnUnauthorized({ silent });
          reject(error);
          return;
        }
        setAuthHeader(original, token);
        resolve(api.request(original));
      });
    });
  }

  // refresh 시작
  isRefreshing = true;

  try {
    const newToken = await requestRefresh();
    flushQueue(newToken);
    isRefreshing = false;

    setAuthHeader(original, newToken);
    return api.request(original);
  } catch (e) {
    console.error(e);
    flushQueue(null);
    isRefreshing = false;

    runOnUnauthorized({ silent });
    return Promise.reject(error);
  }
};
