import { create } from "zustand";

type AuthState = {
  isAuthenticated: boolean;
  setAuthenticated: (v: boolean) => void;
  syncFromStorage: () => void;
};

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: !!localStorage.getItem("token"),
  setAuthenticated: (v) => set({ isAuthenticated: v }),
  syncFromStorage: () => set({ isAuthenticated: !!localStorage.getItem("token") }),
}));

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
