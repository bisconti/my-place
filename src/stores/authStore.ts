/*
  file: authStore.ts
  description
  - zustand 기반 인증 상태를 관리하고 access token은 짧은 저장(sessionStorage)으로 유지하는 파일
*/
import toast from "react-hot-toast";
import { create } from "zustand";
import { APP_MESSAGES } from "../constants/messages";
import type { User } from "../types/user/user.types";
import { authStorage } from "./authStorage";

type AuthStore = {
  user: User | null;
  token: string | null;
  bootstrapped: boolean;
  initAuth: () => Promise<void>;
  setAuth: (payload: { user: User; token: string }) => void;
  setAccessToken: (token: string | null) => void;
  setUser: (user: User | null) => void;
  logout: (options?: { silent?: boolean; reason?: "manual" | "expired" }) => void;
};

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  token: null,
  bootstrapped: false,

  initAuth: async () => {
    set({
      user: authStorage.getUser(),
      token: authStorage.getAccessToken(),
      bootstrapped: true,
    });
  },

  setAuth: ({ user, token }) => {
    authStorage.setUser(user);
    authStorage.setAccessToken(token);
    authStorage.setHadAuthSession();

    set({
      user,
      token,
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
      bootstrapped: true,
    });

    if (silent) return;

    if (reason === "manual") {
      toast.success(APP_MESSAGES.auth.logoutSuccess);
      window.location.href = "/";
      return;
    }

    toast.error(APP_MESSAGES.auth.sessionExpired);
    window.location.href = "/login";
  },
}));

export const runOnUnauthorized = ({ silent = false }: { silent?: boolean } = {}) => {
  useAuthStore.getState().logout({ silent, reason: "expired" });
};

export const isDuringBoot = () => {
  return !useAuthStore.getState().bootstrapped;
};
