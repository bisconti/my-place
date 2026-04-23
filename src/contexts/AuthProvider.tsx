/*
  file: AuthProvider.tsx
  description
  - zustand 인증 상태와 refresh cookie 기반 access token 부트스트랩을 AuthContext로 연결하는 파일
*/
import { useCallback, useEffect, useMemo, type ReactNode } from "react";
import { api } from "../api/api";
import { authStorage } from "../stores/authStorage";
import { useAuthStore } from "../stores/authStore";
import type { User } from "../types/user/user.types";
import { AuthContext } from "./AuthContext";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const user = useAuthStore((state) => state.user);
  const token = useAuthStore((state) => state.token);
  const initAuth = useAuthStore((state) => state.initAuth);
  const setAuth = useAuthStore((state) => state.setAuth);
  const logoutStore = useAuthStore((state) => state.logout);
  const setUserStore = useAuthStore((state) => state.setUser);
  const setAccessToken = useAuthStore((state) => state.setAccessToken);

  useEffect(() => {
    const bootstrap = async () => {
      await initAuth();

      if (authStorage.getAccessToken()) {
        return;
      }

      if (!authStorage.getUser() && !authStorage.getHadAuthSession()) {
        return;
      }

      try {
        const response = await api.post<{ accessToken?: string }>("/auth/refresh");
        const nextToken = response.data?.accessToken;

        if (nextToken) {
          setAccessToken(nextToken);
          authStorage.setHadAuthSession();
        }
      } catch {
        logoutStore({ silent: true, reason: "expired" });
      }
    };

    void bootstrap();
  }, [initAuth, logoutStore, setAccessToken]);

  const isLoggedIn = !!user && !!token;

  const login = useCallback(
    (userData: User, accessToken: string) => {
      setAuth({
        user: userData,
        token: accessToken,
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
