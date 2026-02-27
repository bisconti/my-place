/*
  파일명: useAuthAutoRefresh.ts
  기능 
  - 사용자가 앱을 쓰고 있는 동안(클릭/키보드/마우스) 토큰 만료가 임박하면 자동으로 refresh를 호출해서 access token을 갱신하고, 실패하면 상황에 맞게 로그아웃 처리
*/
import { useEffect, useRef } from "react";
import { api } from "../api/api";
import { runOnUnauthorized } from "../stores/authStore";

const getJwtLeftSec = () => {
  const token = localStorage.getItem("token");
  if (!token) return 0;

  try {
    const payload = JSON.parse(atob(token.split(".")[1]));
    // exp: seconds
    return Math.floor(payload.exp - Date.now() / 1000);
  } catch {
    return 0;
  }
};

export function useAuthAutoRefresh() {
  const lastRefreshAt = useRef(0);

  useEffect(() => {
    const onActivity = async () => {
      const token = localStorage.getItem("token");
      const refreshToken = localStorage.getItem("refreshToken");

      // 새 탭/새 창에서 localStorage만 남아 있는 상태를 구분하기 위한 플래그
      const hadAuthSession = sessionStorage.getItem("hadAuthSession") === "1";

      // 토큰/리프레시토큰이 둘 다 없으면 이미 로그아웃 상태
      if (!token && !refreshToken) return;

      const left = getJwtLeftSec();

      // 5분 이상 남았으면 아무것도 안 함
      if (left > 5 * 60) return;

      // 60초 쿨타임
      if (Date.now() - lastRefreshAt.current < 60_000) return;
      lastRefreshAt.current = Date.now();

      try {
        /**
         * refresh 호출
         * - api 인스턴스를 쓰면, api.ts의 인터셉터/로깅/정책과 일관되게 동작
         */
        const res = await api.post("/auth/refresh", refreshToken ? { refreshToken } : undefined);

        const newAccessToken = res.data?.accessToken;
        if (newAccessToken) localStorage.setItem("token", newAccessToken);

        const newRefreshToken = res.data?.refreshToken;
        if (newRefreshToken) localStorage.setItem("refreshToken", newRefreshToken);

        /**
         * refresh 성공은 "이 탭에서 인증이 성공"한 것이므로 탭 플래그 기록
         * (새 탭에서도 토큰이 유효하면 이후부터는 일반 세션처럼 취급)
         */
        sessionStorage.setItem("hadAuthSession", "1");
      } catch (e) {
        console.log(e);

        /**
         * - 새 탭/재접속(이 탭에서 인증 성공 이력이 없음): silent logout (alert/리다이렉트 X)
         * - 사용 중 세션(인증 성공 이력이 있음): non-silent (alert + /login)
         */
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
