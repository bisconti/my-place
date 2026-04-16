/*
  파일명: AuthProvider.tsx
  기능 
  - zustand auth state/action을 AuthContext로 내려주는 bridge
  - 앱 시작 시 initAuth()로 storage 기반 인증 상태 복구
*/
import { useCallback, useEffect, useMemo, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import type { User } from "../types/user/user.types";
import { useAuthStore } from "../stores/authStore";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);

  const initAuth = useAuthStore((state) => state.initAuth);
  const setAuth = useAuthStore((state) => state.setAuth);
  const logoutStore = useAuthStore((state) => state.logout);
  const setUserStore = useAuthStore((state) => state.setUser);

  useEffect(() => {
    initAuth();
  }, [initAuth]);

  const isLoggedIn = !!user && !!token;

  const login = useCallback(
    (userData: User, accessToken: string, refreshToken?: string) => {
      setAuth({
        user: userData,
        token: accessToken,
        refreshToken,
      });
    },
    [setAuth]
  );

  const logout = useCallback(() => {
    logoutStore({ silent: true, reason: "manual" });
  }, [logoutStore]);

  const updateUser = useCallback(
    (partial: Partial<User>) => {
      if (!user) return;

      const nextUser = { ...user, ...partial };
      setUserStore(nextUser);
    },
    [user, setUserStore]
  );

  const value = useMemo(
    () => ({
      user,
      isLoggedIn,
      login,
      logout,
      updateUser,
    }),
    [user, isLoggedIn, login, logout, updateUser]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
