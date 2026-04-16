/*
  파일명: authStore.ts
  기능
  - zustand 기반 인증 전역 상태 관리
*/

import { create } from "zustand";
import { authStorage } from "./authStorage";
import type { User } from "../types/user/user.types";

type AuthStore = {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  bootstrapped: boolean;

  initAuth: () => void;
  setAuth: (payload: { user: User; token: string; refreshToken?: string | null }) => void;
  setAccessToken: (token: string | null) => void;
  setRefreshToken: (refreshToken: string | null) => void;
  setUser: (user: User | null) => void;
  logout: (options?: { silent?: boolean; reason?: "manual" | "expired" }) => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  refreshToken: null,
  bootstrapped: false,

  initAuth: () => {
    const user = authStorage.getUser();
    const token = authStorage.getAccessToken();
    const refreshToken = authStorage.getRefreshToken();

    set({
      user,
      token,
      refreshToken,
      bootstrapped: true,
    });
  },

  setAuth: ({ user, token, refreshToken }) => {
    authStorage.setUser(user);
    authStorage.setAccessToken(token);

    if (refreshToken) {
      authStorage.setRefreshToken(refreshToken);
    }

    authStorage.setHadAuthSession();

    set({
      user,
      token,
      refreshToken: refreshToken ?? authStorage.getRefreshToken(),
      bootstrapped: true,
    });
  },

  setAccessToken: (token) => {
    if (token) {
      authStorage.setAccessToken(token);
    } else {
      authStorage.clearAccessToken();
    }

    set({ token });
  },

  setRefreshToken: (refreshToken) => {
    if (refreshToken) {
      authStorage.setRefreshToken(refreshToken);
    } else {
      authStorage.clearRefreshToken();
    }

    set({ refreshToken });
  },

  setUser: (user) => {
    if (user) {
      authStorage.setUser(user);
    } else {
      authStorage.clearUser();
    }

    set({ user });
  },

  logout: ({ silent = false, reason = "expired" } = {}) => {
    authStorage.clearAllAuth();

    set({
      user: null,
      token: null,
      refreshToken: null,
      bootstrapped: true,
    });

    if (!silent) {
      if (reason === "manual") {
        window.location.href = "/";
        return;
      }

      alert("세션이 만료되어 로그아웃되었어요. 다시 로그인해 주세요.");
      window.location.href = "/login";
    }
  },
}));

export const runOnUnauthorized = ({ silent = false }: { silent?: boolean } = {}) => {
  useAuthStore.getState().logout({ silent, reason: "expired" });
};

export const isDuringBoot = () => {
  return !useAuthStore.getState().bootstrapped;
};
