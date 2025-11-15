// 회원가입, 로그인 등 사용자 관련 인터페이스, 타입 정의
import { type FieldErrors, type UseFormRegister } from "react-hook-form";

// 사용자 정보 타입 정의
export interface User {
  useremail: string;
  username: string;
}

// Context에서 제공할 값들의 type 정의
export interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  login: (userData: User, token: string) => void;
  logout: () => void;
}

// 회원가입폼
export interface RegisterFormData {
  email: string;
  password: string;
  name: string;
  birthDate: string;
  gender: "MALE" | "FEMALE";
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

// 이메일 중복 체크 상태 타입
export type EmailCheckStatus = "idle" | "checking" | "available" | "duplicate" | "error";

// 회원가입 API 에러 객체 인터페이스
export interface SignUpError {
  response: {
    status: number;
    data: { message: string };
  };
}
