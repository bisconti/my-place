import { createContext, type Context } from "react";
import type { AuthContextType } from "../types/user/user.types";

export const AuthContext: Context<AuthContextType | undefined> = createContext<AuthContextType | undefined>(undefined);
