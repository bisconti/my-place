/*
  file: auth.api.ts
  description
  - 인증이 필요하지 않은 로그인, 회원가입, 비밀번호 재설정 관련 API를 정의하는 파일
*/
import type { LoginFormData, RegisterFormData } from "../../schemas/authSchema";
import type {
  EmailDupCheckResponse,
  SendPasswordEmailResponse,
  SignInResponse,
  SignUpResponse,
} from "../../types/user/auth.types";
import type { ResetPasswordResponse, ValidateResetPasswordTokenResponse } from "../../types/user/user.types";
import { http } from "../http";

export const checkEmailDup = (email: string) => {
  return http.post<EmailDupCheckResponse>("/auth/checkEmailDup", { email });
};

export const signUp = (data: RegisterFormData) => {
  return http.post<SignUpResponse>("/auth/signUp", data);
};

export const signIn = (data: LoginFormData) => {
  return http.post<SignInResponse>("/auth/login", data, { withCredentials: true });
};

export const signOut = (email?: string) => {
  return http.post("/auth/logout", { email }, { withCredentials: true });
};

export const sendPasswordEmail = (email: string) => {
  return http.post<SendPasswordEmailResponse>("/auth/sendEmail", { email });
};

export const validateResetPasswordToken = (token: string) => {
  return http.get<ValidateResetPasswordTokenResponse>("/auth/reset-password/validate", { params: { token } });
};

export const resetPassword = (token: string, newPassword: string) => {
  return http.post<ResetPasswordResponse>("/auth/reset-password", { token, newPassword });
};
