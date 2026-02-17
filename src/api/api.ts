import axios from "axios";
import type { AxiosError, AxiosRequestConfig, AxiosRequestHeaders } from "axios";
import { runOnUnauthorized } from "../stores/authStore";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "",
  //withCredentials: true,
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

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

  // 새 refreshToken도 주면 갱신
  const newRefreshToken = res.data?.refreshToken;
  if (newRefreshToken) localStorage.setItem("refreshToken", newRefreshToken);

  localStorage.setItem("token", newAccessToken);
  return newAccessToken;
};

// 헤더 세팅 헬퍼
const setAuthHeader = (config: AxiosRequestConfig, token: string) => {
  config.headers = (config.headers ?? {}) as AxiosRequestHeaders;
  (config.headers as AxiosRequestHeaders)["Authorization"] = `Bearer ${token}`;
};

// 토큰 만료/미인증 공통 처리 (401/403)
api.interceptors.response.use(
  (res) => res,
  async (error: AxiosError) => {
    const status = error?.response?.status;
    const original = error.config as AxiosRequestConfig & { _retry?: boolean };

    // 401만 refresh 대상
    if (status !== 401) {
      if (status === 403) {
        runOnUnauthorized();
        return Promise.reject(error);
      }
      return Promise.reject(error);
    }

    // refresh 엔드포인트에서 401이면 즉시 로그아웃
    const url = original?.url ?? "";
    if (url.includes("/auth/refresh")) {
      runOnUnauthorized();
      return Promise.reject(error);
    }

    // 무한루프 방지
    if (original?._retry) {
      runOnUnauthorized();
      return Promise.reject(error);
    }
    original._retry = true;

    // 이미 refresh 중이면 대기했다가 토큰 받으면 재시도
    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        enqueue((token) => {
          if (!token) {
            runOnUnauthorized();
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
    } catch (error) {
      flushQueue(null);
      isRefreshing = false;

      runOnUnauthorized();
      return Promise.reject(error);
    }
  }
);
