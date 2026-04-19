/*
  file: AuthContext.ts
  description
  - 전역 인증 상태와 인증 액션을 공유하기 위한 React Context 정의 파일
*/
import { createContext, type Context } from "react";
import type { AuthContextType } from "../types/user/user.types";

export const AuthContext: Context<AuthContextType | undefined> = createContext<AuthContextType | undefined>(undefined);
