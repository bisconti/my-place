/*
  파일명: useAuthAutoRefresh.ts
  기능
  - 사용자 활동 중 access token 만료 임박 시 refresh 호출
*/

import { useEffect, useRef } from "react";
import { api } from "../api/api";
import { authStorage } from "../stores/authStorage";
import { runOnUnauthorized, useAuthStore } from "../stores/authStore";
import type { RefreshResponse } from "../types/user/auth.types";

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
      const refreshToken = authStorage.getRefreshToken();
      const hadAuthSession = authStorage.getHadAuthSession();

      if (!token && !refreshToken) return;

      const left = getJwtLeftSec();

      if (left > 5 * 60) return;

      if (Date.now() - lastRefreshAt.current < 60_000) return;
      lastRefreshAt.current = Date.now();

      try {
        const res = await api.post<RefreshResponse>("/auth/refresh", refreshToken ? { refreshToken } : undefined);

        const newAccessToken = res.data?.accessToken;
        const newRefreshToken = res.data?.refreshToken;

        if (newAccessToken) {
          useAuthStore.getState().setAccessToken(newAccessToken);
        }

        if (newRefreshToken) {
          useAuthStore.getState().setRefreshToken(newRefreshToken);
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
