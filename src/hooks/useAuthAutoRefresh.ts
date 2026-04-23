/*
  file: useAuthAutoRefresh.ts
  description
  - 사용자 활동 중 access token 만료가 가까우면 refresh cookie를 사용해 access token을 갱신하는 훅
*/
import { useEffect, useRef } from "react";
import type { RefreshResponse } from "../types/user/auth.types";
import { api } from "../api/api";
import { authStorage } from "../stores/authStorage";
import { runOnUnauthorized, useAuthStore } from "../stores/authStore";

const getJwtLeftSec = () => {
  const token = authStorage.getAccessToken();
  if (!token) return 0;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    return Math.floor(payload.exp - Date.now() / 1000);
  } catch {
    return 0;
  }
};

export function useAuthAutoRefresh() {
  const lastRefreshAt = useRef(0);

  useEffect(() => {
    const onActivity = async () => {
      const token = authStorage.getAccessToken();
      const hadAuthSession = authStorage.getHadAuthSession();

      if (!token && !hadAuthSession) return;

      const left = getJwtLeftSec();
      if (token && left > 5 * 60) return;

      if (Date.now() - lastRefreshAt.current < 60_000) return;
      lastRefreshAt.current = Date.now();

      try {
        const response = await api.post<RefreshResponse>("/auth/refresh");
        const nextToken = response.data?.accessToken;

        if (nextToken) {
          useAuthStore.getState().setAccessToken(nextToken);
        }

        authStorage.setHadAuthSession();
      } catch (error) {
        console.error("토큰 갱신 실패:", error);
        runOnUnauthorized({ silent: !hadAuthSession });
      }
    };

    window.addEventListener("click", onActivity);
    window.addEventListener("keydown", onActivity);
    window.addEventListener("mousemove", onActivity);

    return () => {
      window.removeEventListener("click", onActivity);
      window.removeEventListener("keydown", onActivity);
      window.removeEventListener("mousemove", onActivity);
    };
  }, []);
}
