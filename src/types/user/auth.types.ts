/*
  file: auth.types.ts
  description
  - 인증 관련 API 요청/응답 타입과 공통 인증 상태 타입을 정의하는 파일
*/
import type { User } from "./user.types";

export interface AuthState {
  user: User | null;
  token: string | null;
}

export interface RefreshResponse {
  accessToken?: string;
  refreshToken?: string;
}

export interface SignInResponse {
  user: {
    useremail: string;
    username: string;
  };
  token: string;
}

export interface SignUpResponse {
  message: string;
}

export interface EmailDupCheckResponse {
  available: boolean;
}

export interface SendPasswordEmailResponse {
  message: string;
}
