/*
  파일명: auth.api.ts
  기능 
  - 로그인하지 않고 요청할 수 있는 API 정의
*/
import { http } from "./http";
import type { RegisterFormData } from "../schemas/authSchema";

// 이메일 중복체크
export const checkEmailDup = (email: string) => {
  return http.post("/auth/checkEmailDup", { email });
};

// 회원가입
export const signUp = (data: RegisterFormData) => {
  return http.post("/auth/signUp", data);
};

// 이메일
export const sendPasswordEmail = (email: string) => {
  return http.post("/auth/sendEmail", { email });
};
