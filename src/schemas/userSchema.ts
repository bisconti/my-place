import * as yup from "yup";

// 이메일 정규식, 메시지
const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const emailMsg = "올바른 이메일 형식이 아닙니다.";

// 비밀번호 정규식, 메시지
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+=-]).{8,16}$/;
const passwordMsg = "비밀번호는 8자 이상이며, 특수문자, 영문, 숫자를 모두 포함해야 합니다.";

// 회원가입 유효성 스키마 정의
export const RegisterSchema = yup
  .object({
    email: yup.string().matches(emailRegex, emailMsg).required("이메일을 입력하세요."),
    password: yup
      .string()
      .min(8, "비밀번호는 최소 8자 이상이어야 합니다.")
      .max(16, "비밀번호는 최대 16자 이하여야 합니다.")
      .matches(passwordRegex, passwordMsg)
      .required("비밀번호를 입력하세요."),
    username: yup.string().min(2, "이름은 최소 2자 이상이어야 합니다.").required("이름을 입력하세요."),
    nickname: yup
      .string()
      .required("닉네임을 입력해주세요.")
      .min(2, "닉네임은 최소 2자 이상 입력해주세요.")
      .max(20, "닉네임은 최대 20자까지 가능합니다."),
    birthDate: yup
      .string()
      .required("생년월일은 필수 입력 사항입니다.")
      .matches(/^\d{4}-\d{2}-\d{2}$/, "유효한 날짜 형식(YYYY-MM-DD)을 선택해 주세요."),
    gender: yup.string().oneOf(["M", "F"], "성별을 선택해 주세요.").required("성별은 필수 선택 사항입니다."),
    bio: yup.string().max(100, "소개는 최대 100자까지 가능합니다.").nullable().default(null),
  })
  .required();

// 회원가입 폼 데이터 타입 추론
export type RegisterFormData = yup.InferType<typeof RegisterSchema>;

// 로그인 폼 유효성 검증 스키마 정의
export const LoginSchema = yup
  .object({
    email: yup
      .string()
      .matches(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, "올바른 이메일 형식이 아닙니다.")
      .required("이메일을 입력하세요."),
    password: yup.string().required("비밀번호를 입력하세요."),
  })
  .required();

// 로그인 폼 데이터 타입 추론
export type LoginFormData = yup.InferType<typeof LoginSchema>;

// 비밀번호 찾기 유효성 스키마 정의
export const FindPasswordSchema = yup.object({
  email: yup.string().email("올바른 이메일 형식이 아닙니다.").required("이메일을 입력해 주세요."),
});

// 비밀번호 변경 유효성 스키마 정의
export const ResetPasswordSchema = yup.object({
  password: yup.string().required("새 비밀번호를 입력해주세요.").min(8, "비밀번호는 최소 8자 이상이어야 합니다."),
  confirmPassword: yup
    .string()
    .required("비밀번호 확인을 입력해주세요.")
    .oneOf([yup.ref("password")], "비밀번호가 일치하지 않습니다."),
});

// 비밀번호 변경 데이터 타입 추론
export type ResetPasswordFormData = yup.InferType<typeof ResetPasswordSchema>;
