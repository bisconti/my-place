/*
  파일명: useAuth.ts
  기능 
  - useContext(AuthContext)를 한줄로 꺼내 쓰기 위한 custom hook
*/
import { useContext } from "react";
import type { AuthContextType } from "../types/user/user.types";
import { AuthContext } from "../contexts/AuthContext";

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("error!");
  }

  return context;
};
