import { useContext } from "react";
import type { AuthContextType } from "../types/user/user.types";
import { AuthContext } from "./AuthContext";

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error("error!");
  }

  return context;
};
