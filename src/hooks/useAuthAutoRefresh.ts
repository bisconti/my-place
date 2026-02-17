import { useEffect, useRef } from "react";
import { api } from "../api/api"; // 네 경로에 맞게
import { runOnUnauthorized } from "../stores/authStore";

const getJwtLeftSec = () => {
  const token = localStorage.getItem("token");
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
      const left = getJwtLeftSec();

      // 5분 이상 남았으면 아무것도 안 함
      if (left > 5 * 60) return;

      // 60초 쿨타임
      if (Date.now() - lastRefreshAt.current < 60_000) return;
      lastRefreshAt.current = Date.now();

      try {
        // 쿠키 방식이면 body 없이, localStorage 방식이면 refreshToken body 포함 필요
        const refreshToken = localStorage.getItem("refreshToken");
        const res = await api.post("/auth/refresh", refreshToken ? { refreshToken } : undefined);

        const newAccessToken = res.data?.accessToken;
        if (newAccessToken) localStorage.setItem("token", newAccessToken);

        const newRefreshToken = res.data?.refreshToken;
        if (newRefreshToken) localStorage.setItem("refreshToken", newRefreshToken);
      } catch (e) {
        console.log(e);
        runOnUnauthorized();
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
