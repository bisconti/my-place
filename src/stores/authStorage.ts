/*
  파일명: authStorage.ts
  기능
  - 인증 관련 localStorage / sessionStorage 접근 전담
*/

import type { User } from "../types/user/user.types";

const STORAGE_KEYS = {
  USER: "user",
  TOKEN: "token",
  REFRESH_TOKEN: "refreshToken",
  HAD_AUTH_SESSION: "hadAuthSession",
  LAST_ACTIVITY: "lastActivityAt",
} as const;

export const authStorage = {
  getUser(): User | null {
    const raw = localStorage.getItem(STORAGE_KEYS.USER);
    if (!raw) return null;

    try {
      return JSON.parse(raw) as User;
    } catch (error) {
      console.error("user 파싱 실패:", error);
      return null;
    }
  },

  setUser(user: User) {
    localStorage.setItem(STORAGE_KEYS.USER, JSON.stringify(user));
  },

  clearUser() {
    localStorage.removeItem(STORAGE_KEYS.USER);
  },

  getAccessToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.TOKEN);
  },

  setAccessToken(token: string) {
    localStorage.setItem(STORAGE_KEYS.TOKEN, token);
  },

  clearAccessToken() {
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
  },

  getRefreshToken(): string | null {
    return localStorage.getItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  setRefreshToken(refreshToken: string) {
    localStorage.setItem(STORAGE_KEYS.REFRESH_TOKEN, refreshToken);
  },

  clearRefreshToken() {
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
  },

  getHadAuthSession(): boolean {
    return sessionStorage.getItem(STORAGE_KEYS.HAD_AUTH_SESSION) === "1";
  },

  setHadAuthSession() {
    sessionStorage.setItem(STORAGE_KEYS.HAD_AUTH_SESSION, "1");
  },

  clearHadAuthSession() {
    sessionStorage.removeItem(STORAGE_KEYS.HAD_AUTH_SESSION);
  },

  clearAllAuth() {
    localStorage.removeItem(STORAGE_KEYS.USER);
    localStorage.removeItem(STORAGE_KEYS.TOKEN);
    localStorage.removeItem(STORAGE_KEYS.REFRESH_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.HAD_AUTH_SESSION);
  },

  // 사용자 마지막 활동 시간 get
  getLastActivity(): number {
    return Number(localStorage.getItem(STORAGE_KEYS.LAST_ACTIVITY) || "0");
  },

  // 사용자 마지막 활동 시간 set
  setLastActivity(time: number) {
    localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, String(time));
  },
};
