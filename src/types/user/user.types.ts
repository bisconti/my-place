/*
  file: user.types.ts
  description
  - 사용자 도메인 전반에서 사용하는 인증, 프로필, 폼 관련 타입을 정의하는 파일
*/
import { type FieldErrors, type UseFormRegister } from "react-hook-form";

export interface User {
  useremail: string;
  username?: string;
}

export interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (userData: User, accessToken: string, refreshToken?: string) => void;
  logout: () => void;
  updateUser: (partial: Partial<User>) => void;
}

export interface RegisterFormData {
  email: string;
  password: string;
  username: string;
  birthDate: string;
  gender: "M" | "F";
}

export interface SignUpInputFieldProps {
  label: string;
  name: keyof RegisterFormData;
  type?: string;
  placeholder?: string;
  disabled: boolean;
  errors: FieldErrors<RegisterFormData>;
  register: UseFormRegister<RegisterFormData>;
}

export type EmailCheckStatus = "idle" | "checking" | "available" | "duplicate" | "error";

export interface FindPasswordFormData {
  email: string;
}

export interface ValidateResetPasswordTokenResponse {
  message: string;
}

export interface ResetPasswordResponse {
  message: string;
}

export interface MyProfileResponse {
  useremail: string;
  nickname: string;
  bio: string | null;
}

export interface UpdateMyProfileRequest {
  nickname: string;
  bio: string | null;
}
