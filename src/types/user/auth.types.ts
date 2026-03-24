/*
  파일명: auth.types.ts
  기능
  - 로그인, 회원가입 등 비 로그인 요청 API 요청/응답 타입 정의
  - 인증 관련 공통 타입
*/

export interface LoginUser {
  useremail: string;
  username?: string;
}

export interface AuthState {
  user: LoginUser | null;
  token: string | null;
  refreshToken: string | null;
}

export interface RefreshResponse {
  accessToken?: string;
  refreshToken?: string;
}

// 로그인 응답 인터페이스
export interface SignInResponse {
  user: {
    useremail: string;
    username: string;
  };
  token: string;
  refreshToken: string;
}

// 회원가입 응답 인터페이스
export interface SignUpResponse {
  message: string;
}

// 이메일 중복체크 응답 인터페이스
export interface EmailDupCheckResponse {
  available: boolean;
}

// 비밀번호 찾기(이메일 전송) 인터페이스
export interface SendPasswordEmailResponse {
  message: string;
}
