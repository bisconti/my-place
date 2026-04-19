/*
  file: useAuth.ts
  description
  - AuthContext를 안전하게 꺼내 쓰기 위한 인증 전용 커스텀 훅
*/
import { useContext } from "react";
import type { AuthContextType } from "../types/user/user.types";
import { AuthContext } from "../contexts/AuthContext";

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("AuthProvider 내부에서만 useAuth를 사용할 수 있습니다.");
  }

  return context;
};
