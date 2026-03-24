/*
  파일명: authStore.ts
  기능
  - zustand 기반 인증 전역 상태 관리
*/

import { create } from "zustand";
import { authStorage } from "./authStorage";
import type { LoginUser } from "../types/user/auth.types";

type AuthStore = {
  user: LoginUser | null;
  token: string | null;
  refreshToken: string | null;
  bootstrapped: boolean;

  initAuth: () => void;
  setAuth: (payload: { user: LoginUser; token: string; refreshToken?: string | null }) => void;
  setAccessToken: (token: string | null) => void;
  setRefreshToken: (refreshToken: string | null) => void;
  setUser: (user: LoginUser | null) => void;
  logout: (options?: { silent?: boolean }) => void;
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

  logout: ({ silent = false } = {}) => {
    authStorage.clearAllAuth();

    set({
      user: null,
      token: null,
      refreshToken: null,
      bootstrapped: true,
    });

    if (!silent) {
      alert("로그인이 만료되었습니다. 다시 로그인해주세요.");
      window.location.href = "/login";
    }
  },
}));

export const runOnUnauthorized = ({ silent = false }: { silent?: boolean } = {}) => {
  useAuthStore.getState().logout({ silent });
};

export const isDuringBoot = () => {
  return !useAuthStore.getState().bootstrapped;
};
