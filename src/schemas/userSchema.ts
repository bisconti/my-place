import * as yup from "yup";

// 비밀번호 정규식, 메시지
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+=-]).{8,16}$/;
const passwordMsg = "비밀번호는 8자 이상이며, 특수문자, 영문, 숫자를 모두 포함해야 합니다.";

// 비밀번호 변경 스키마 정의
export const ChangePasswordSchema = yup.object({
  currentPassword: yup.string().required("현재 비밀번호를 입력해주세요."),
  newPassword: yup
    .string()
    .required("새 비밀번호를 입력해주세요.")
    .min(8, "비밀번호는 최소 8자 이상이어야 합니다.")
    .max(16, "비밀번호는 최대 16자 이하여야 합니다.")
    .matches(passwordRegex, passwordMsg),
  confirmPassword: yup
    .string()
    .required("새 비밀번호 확인을 입력해주세요.")
    .oneOf([yup.ref("newPassword")], "새 비밀번호가 일치하지 않습니다."),
});

// 비밀번호 변경 데이터 타입 추론
export type ChangePasswordFormData = yup.InferType<typeof ChangePasswordSchema>;
