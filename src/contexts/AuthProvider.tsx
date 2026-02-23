import { useEffect, useMemo, useState, type ReactNode } from "react";
import { AuthContext } from "./AuthContext";
import type { User } from "../types/user/user.types";
import { setOnUnauthorized, useAuthStore } from "../stores/authStore";

type UnauthorizedOptions = {
  silent?: boolean; // true면 안내/리다이렉트 없이 로그아웃만
};

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  });

  useEffect(() => {
    setOnUnauthorized((opts?: UnauthorizedOptions) => {
      // 토큰 제거
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("refreshToken");
      sessionStorage.removeItem("hadAuthSession");
      useAuthStore.getState().setAuthenticated(false);

      // user 상태 제거
      setUser(null);

      if (opts?.silent) return;

      alert("세션이 만료되었습니다. 다시 로그인 해주세요.");
      window.location.href = "/login";
    });
  }, []);

  const isLoggedIn = !!user;

  const login = (userData: User, token: string) => {
    localStorage.setItem("user", JSON.stringify(userData));
    localStorage.setItem("token", token);

    // 이 탭에서 "인증 성공"을 실제로 경험했음을 기록
    sessionStorage.setItem("hadAuthSession", "1");

    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("refreshToken");
    sessionStorage.removeItem("hadAuthSession");
    setUser(null);
  };

  const updateUser = (partial: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...partial };
      localStorage.setItem("user", JSON.stringify(next));
      return next;
    });
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
