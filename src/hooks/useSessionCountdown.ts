/*
  file: useSessionCountdown.ts
  description
  - 사용자 활동 시간과 JWT 만료 시간을 기준으로 헤더 세션 카운트다운을 관리하는 훅
*/
import { useEffect, useRef, useState } from "react";
import { authStorage } from "../stores/authStorage";
import { useAuthStore } from "../stores/authStore";

const IDLE_TIMEOUT_SEC = 15 * 60;

function formatMMSS(totalSec: number) {
  const minutes = Math.floor(totalSec / 60);
  const seconds = totalSec % 60;
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
}

function base64UrlDecode(input: string) {
  const pad = "=".repeat((4 - (input.length % 4)) % 4);
  const base64 = (input + pad).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const bytes = Uint8Array.from(raw, (char) => char.charCodeAt(0));
  return new TextDecoder().decode(bytes);
}

function getJwtLeftSec(token: string): number | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = JSON.parse(base64UrlDecode(parts[1]));
    if (typeof payload?.exp !== "number") return null;

    return Math.max(0, payload.exp - Math.floor(Date.now() / 1000));
  } catch {
    return null;
  }
}

function getIdleLeftSec() {
  const lastActivity = authStorage.getLastActivity();
  if (!lastActivity) return IDLE_TIMEOUT_SEC;

  const diffSec = Math.floor((Date.now() - lastActivity) / 1000);
  return Math.max(0, IDLE_TIMEOUT_SEC - diffSec);
}

export function useSessionCountdown() {
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);

  const [leftSec, setLeftSec] = useState<number | null>(null);
  const expiredHandledRef = useRef(false);
  const lastWriteRef = useRef(0);

  const touchActivity = () => {
    const now = Date.now();
    if (now - lastWriteRef.current < 1000) return;

    lastWriteRef.current = now;
    authStorage.setLastActivity(now);
  };

  useEffect(() => {
    expiredHandledRef.current = false;

    if (!user) {
      setLeftSec(null);
      return;
    }

    touchActivity();
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const onActivity = () => touchActivity();

    window.addEventListener("click", onActivity);
    window.addEventListener("keydown", onActivity);
    window.addEventListener("mousemove", onActivity);
    window.addEventListener("scroll", onActivity, { passive: true });
    window.addEventListener("touchstart", onActivity, { passive: true });

    return () => {
      window.removeEventListener("click", onActivity);
      window.removeEventListener("keydown", onActivity);
      window.removeEventListener("mousemove", onActivity);
      window.removeEventListener("scroll", onActivity);
      window.removeEventListener("touchstart", onActivity);
    };
  }, [user]);

  useEffect(() => {
    if (!user) return;

    const tick = () => {
      const idleLeft = getIdleLeftSec();
      const token = authStorage.getAccessToken();
      const jwtLeft = token ? getJwtLeftSec(token) : null;

      setLeftSec(jwtLeft === null ? idleLeft : Math.min(idleLeft, jwtLeft));
    };

    tick();
    const intervalId = window.setInterval(tick, 1000);
    return () => window.clearInterval(intervalId);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (leftSec === null || leftSec > 0) return;
    if (expiredHandledRef.current) return;

    expiredHandledRef.current = true;
    logout({ silent: true, reason: "expired" });
  }, [leftSec, logout, user]);

  return {
    leftSec,
    timeText: leftSec === null ? "" : formatMMSS(leftSec),
    touchActivity,
    isExpired: leftSec === 0,
  };
}
