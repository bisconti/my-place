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
import { isDuringBoot, runOnUnauthorized } from "../stores/authStore";

// 공용 axios 객체 생성
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "",
});

type RetryableRequestConfig = AxiosRequestConfig & { _retry?: boolean };

// 인증 관련 스토리지 정리
const clearAuthStorage = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");
  sessionStorage.removeItem("hadAuthSession");
};

// 로그아웃 중복 실행 방지
let isUnauthorizedHandling = false;

// runOnUnauthorized 중복 호출 방지용 래퍼
const safeRunOnUnauthorized = ({ silent }: { silent: boolean }) => {
  clearAuthStorage();

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
  const token = localStorage.getItem("token");
  if (!token) return config;

  config.headers = (config.headers ?? {}) as AxiosRequestHeaders;

  // 이미 다른 인증 헤더를 직접 넣은 경우 덮어쓰기 방지
  const existingAuth = getAuthorizationHeader(config.headers as AxiosRequestHeaders);
  if (!existingAuth) {
    (config.headers as AxiosRequestHeaders).Authorization = `Bearer ${token}`;
  }

  return config;
});

// 인증 헤더가 붙은 요청이 성공하면, 이 탭에서 인증이 실제로 성공했음을 기록
// 이전에 인증 성공 한적이 있으면, 세션이 끊긴것으로 판단
// 한번도 인증 성공을 한적이 없으면, 조용히 비로그인 상태 처리
api.interceptors.response.use(
  (res) => {
    const headers = res.config.headers as AxiosRequestHeaders | undefined;
    const hasAuthHeader = typeof getAuthorizationHeader(headers) === "string";

    if (hasAuthHeader) {
      sessionStorage.setItem("hadAuthSession", "1");
      isUnauthorizedHandling = false;
    }
    return res;
  },
  // 401, 403 응답 실패 인터셉터 처리
  async (error: AxiosError) => {
    const status = error?.response?.status;
    const original = (error.config ?? {}) as RetryableRequestConfig;

    const url = original?.url ?? "";
    const hadAuthSession = sessionStorage.getItem("hadAuthSession") === "1";
    // 앱 부팅 중 혹은 인증 성공 이력이 없으면 조용히 로그아웃 처리 위한 변수
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
      // 403도 인증 실패로 취급하여 runOnUnauthorized 실행
      if (status === 403) {
        console.log("[API runOnUnauthorized]", { url, status, silent });
        safeRunOnUnauthorized({ silent });
      }
      return Promise.reject(error);
    }

    // 401 -> access token 만료일 수 있으므로 refresh 시도
    return handle401(error, original, silent);
  }
);

/* =====================================================================================================================
 *                                              refresh token 기능 시작
 * =====================================================================================================================
 */
// 공통 변수
// 현재 refresh 진행 여부를 Promise 단위로 관리
let refreshPromise: Promise<string> | null = null;

// localStorage 에서 refresh token을 읽어서 없으면 실패 처리
const requestRefresh = async (): Promise<string> => {
  const refreshToken = localStorage.getItem("refreshToken");
  if (!refreshToken) throw new Error("no refreshToken");

  // refresh api 호출
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

  // refresh 성공 자체가 이 탭에서 인증 성공이므로 기록
  sessionStorage.setItem("hadAuthSession", "1");
  isUnauthorizedHandling = false;

  return newAccessToken;
};

// 실패한 요청에 발급받은 새 토큰을 다시 주입하는 헬퍼 함수
const setAuthHeader = (config: AxiosRequestConfig, token: string) => {
  config.headers = (config.headers ?? {}) as AxiosRequestHeaders;
  (config.headers as AxiosRequestHeaders).Authorization = `Bearer ${token}`;
};

const handle401 = async (error: AxiosError, original: RetryableRequestConfig, silent: boolean) => {
  // refresh 엔드포인트 결과가 401이면 refresh token도 만료되었거나 무효라는 뜻이므로 즉시 로그아웃
  const url = original?.url ?? "";
  if (url.includes("/auth/refresh")) {
    safeRunOnUnauthorized({ silent });
    return Promise.reject(error);
  }

  // 401 요청 당 refresh 시도는 1번으로 제한하여 무한루프 방지(401 -> refresh -> 다시 401 -> refresh)
  if (original?._retry) {
    safeRunOnUnauthorized({ silent });
    return Promise.reject(error);
  }
  original._retry = true;

  try {
    // refresh token 발급
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
