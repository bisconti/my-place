import axios from "axios";
import type { RegisterFormData } from "../schemas/userSchema";

// 이메일 중복체크
export const checkEmailDup = (email: string) => {
  return axios.post("/auth/checkEmailDup", { email });
};

// 회원가입
export const signUp = (data: RegisterFormData) => {
  return axios.post("/auth/signUp", data);
};

// 이메일 
export const sendPasswordEmail = (email: string) => {
  return axios.post("/auth/sendEmail", { email });
};
