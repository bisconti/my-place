/*
  파일명: auth.api.ts
  기능 
  - 로그인하지 않고 요청할 수 있는 API 정의
*/
import { http } from "./http";
import type { LoginFormData, RegisterFormData } from "../schemas/authSchema";
import type {
  EmailDupCheckResponse,
  SendPasswordEmailResponse,
  SignInResponse,
  SignUpResponse,
} from "../types/user/auth.types";
import type { ResetPasswordResponse, ValidateResetPasswordTokenResponse } from "../types/user/user.types";

// 이메일 중복체크
export const checkEmailDup = (email: string) => {
  return http.post<EmailDupCheckResponse>("/auth/checkEmailDup", { email });
};

// 회원가입
export const signUp = (data: RegisterFormData) => {
  return http.post<SignUpResponse>("/auth/signUp", data);
};

// 로그인
export const signIn = (data: LoginFormData) => {
  return http.post<SignInResponse>("/auth/login", data);
};

// 이메일
export const sendPasswordEmail = (email: string) => {
  return http.post<SendPasswordEmailResponse>("/auth/sendEmail", { email });
};

// 비밀번호 재설정 토큰 만료 검증
export const validateResetPasswordToken = (token: string) => {
  return http.get<ValidateResetPasswordTokenResponse>("/auth/reset-password/validate", { params: { token } });
};

// 비밀번호 재설정
export const resetPassword = (token: string, newPassword: string) => {
  return http.post<ResetPasswordResponse>("/auth/reset-password", { token, newPassword });
};
