/*
  파일명: AuthContext.ts
  기능 
  - Auth 정보를 담는 그릇
*/
import { createContext, type Context } from "react";
import type { AuthContextType } from "../types/user/user.types";

export const AuthContext: Context<AuthContextType | undefined> = createContext<AuthContextType | undefined>(undefined);
