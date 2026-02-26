import { create } from "zustand";
import type { User } from "../types/user/user.types";

type AuthState = {
  user: User | null;
  isAuthenticated: boolean;
  setAuthenticated: (v: boolean) => void;
  setUser: (u: User | null) => void;

  // 편의 액션
  login: (u: User, accessToken: string, refreshToken?: string) => void;
  logout: () => void;

  // 새로고침/복구용
  hydrate: () => void;
};

const readUser = (): User | null => {
  const s = localStorage.getItem("user");
  if (!s) return null;
  try {
    return JSON.parse(s) as User;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => {
  const initialUser = readUser();
  const hasToken = !!localStorage.getItem("token");

  return {
    // ✅ 처음부터 localStorage 기준으로 맞춰 시작 (중요)
    user: hasToken ? initialUser : null,
    isAuthenticated: hasToken && !!initialUser,

    setAuthenticated: (v) => set({ isAuthenticated: v }),
    setUser: (u) =>
      set({
        user: u,
        isAuthenticated: !!localStorage.getItem("token") && !!u,
      }),

    login: (u, accessToken, refreshToken) => {
      // ✅ user도 같이 저장 (Context랑 일치)
      localStorage.setItem("user", JSON.stringify(u));
      localStorage.setItem("token", accessToken);
      if (refreshToken) localStorage.setItem("refreshToken", refreshToken);
      sessionStorage.setItem("hadAuthSession", "1");

      set({ user: u, isAuthenticated: true });
    },

    logout: () => {
      // ✅ user도 같이 제거 (Context랑 일치)
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      sessionStorage.removeItem("hadAuthSession");

      set({ user: null, isAuthenticated: false });
    },

    // ✅ 앱 시작/라우트 전환 타이밍에 상태 복구가 필요할 때 호출
    hydrate: () => {
      const u = readUser();
      const t = !!localStorage.getItem("token");
      set({ user: t ? u : null, isAuthenticated: t && !!u });
    },
  };
});

const BOOT_GRACE_MS = 2500;
let bootAt = Date.now();
export const isDuringBoot = () => Date.now() - bootAt < BOOT_GRACE_MS;
export const resetBootAt = () => {
  bootAt = Date.now();
};
type UnauthorizedOptions = { silent?: boolean };
let onUnauthorized: ((opts?: UnauthorizedOptions) => void) | null = null;
export const setOnUnauthorized = (fn: (opts?: UnauthorizedOptions) => void) => {
  onUnauthorized = fn;
};
export const runOnUnauthorized = (opts?: UnauthorizedOptions) => {
  onUnauthorized?.(opts);
};
