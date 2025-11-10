import { createContext, type Context } from "react";
import type { AuthContextType } from "./AuthTypes";

export const AuthContext: Context<AuthContextType | undefined> = createContext<AuthContextType | undefined>(undefined);