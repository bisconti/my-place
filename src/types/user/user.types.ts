/*
  파일명: user.types.ts
  기능 
  - 사용자 도메인에서 사용하는 타입 및 인터페이스 정의
  - 인증 상태(Context) 관련 타입 정의
  - 회원가입 폼 데이터 및 UI 컴포넌트 props 타입 정의
  - 사용자 관련 API 요청/응답(Request/Response) 타입 정의
*/
import { type FieldErrors, type UseFormRegister } from "react-hook-form";

/* ========================================================================================
 *                사용자 도메인에서 사용하는 type 및 interface 정의 시작
 * ========================================================================================
 */
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
/* ========================================================================================
 *                사용자 도메인에서 사용하는 type 및 interface 정의 끝
 * ========================================================================================
 */

/* ========================================================================================
 *              회원가입 form 데이터 및 UI component props type 정의 시작
 * ========================================================================================
 */

// 회원가입 form
export interface RegisterFormData {
  email: string;
  password: string;
  username: string;
  birthDate: string;
  gender: "M" | "F";
}

// 회원가입 Input component props
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

/* ========================================================================================
 *              회원가입 form 데이터 및 UI component props type 정의 끝
 * ========================================================================================
 */

/* ========================================================================================
 *                              비밀번호 찾기 form 정의 시작
 * ========================================================================================
 */
export interface FindPasswordFormData {
  email: string;
}
/* ========================================================================================
 *                              비밀번호 찾기 form 정의 끝
 * ========================================================================================
 */

/* ========================================================================================
 *                              비밀번호 재설정 form 정의 시작
 * ========================================================================================
 */
export interface ValidateResetPasswordTokenResponse {
  message: string;
}

export interface ResetPasswordResponse {
  message: string;
}
/* ========================================================================================
 *                              비밀번호 재설정 form 정의 끝
 * ========================================================================================
 */

/* ========================================================================================
 *                        사용자 관련 API 요청/응답 타입 정의 시작
 * ========================================================================================
 */

// 내 프로필 조회 응답 인터페이스
export interface MyProfileResponse {
  useremail: string;
  nickname: string;
  bio: string | null;
}

// 내 프로필 조회 요청 인터페이스
export interface UpdateMyProfileRequest {
  nickname: string;
  bio: string | null;
}

/* ========================================================================================
 *                        사용자 관련 API 요청/응답 타입 정의 끝
 * ========================================================================================
 */
