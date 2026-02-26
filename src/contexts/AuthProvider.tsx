/*
  파일명: AuthProvider.tsx
  기능 
  - zustand 에서 auth state/action을 가져와서 AuthContext로 내려줌.
  - 어플리케이션 기동 시 hydrate()로 localStorage 기반 복구
  - 401에러/세션만료 처리를 setOnUnauthorized 에 등록해서 만료시 store.logout() 실행
  - zustand를 Context 형태로 노출하는 bridge 역할
*/
import { useEffect, useMemo, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import type { User } from "../types/user/user.types";
import { setOnUnauthorized, useAuthStore } from "../stores/authStore";

type UnauthorizedOptions = {
  silent?: boolean;
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const user = useAuthStore((s) => s.user);
  const isAuthenticated = useAuthStore((s) => s.isAuthenticated);
  const loginStore = useAuthStore((s) => s.login);
  const logoutStore = useAuthStore((s) => s.logout);
  const setUserStore = useAuthStore((s) => s.setUser);

  const hydrate = useAuthStore((s) => s.hydrate);

  useEffect(() => {
    hydrate();

    setOnUnauthorized((opts?: UnauthorizedOptions) => {
      logoutStore();

      if (opts?.silent) return;

      alert("세션이 만료되었습니다. 다시 로그인 해주세요.");
      window.location.href = "/login";
    });
  }, []);

  const isLoggedIn = !!user && isAuthenticated;

  const login = (userData: User, token: string, refreshToken?: string) => {
    loginStore(userData, token, refreshToken);
  };

  const logout = () => {
    logoutStore();
  };

  const updateUser = (partial: Partial<User>) => {
    if (!user) return;
    const next = { ...user, ...partial } as User;

    setUserStore(next);

    localStorage.setItem("user", JSON.stringify(next));
  };

  const value = useMemo(
    () => ({
      user,
      isLoggedIn,
      login,
      logout,
      updateUser,
    }),
    [user, isLoggedIn]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
