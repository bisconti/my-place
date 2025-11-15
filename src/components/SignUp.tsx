import React, { useCallback, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import * as yup from "yup";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import type { EmailCheckStatus, SignUpError, SignUpInputFieldProps } from "../types/user/user.types";

type RegisterFormData = yup.InferType<typeof RegisterSchema>;

// 이메일 정규식, 메시지
const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const emailMsg = "올바른 이메일 형식이 아닙니다.";
// 비밀번호 정규식, 메시지
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+=-]).{8,16}$/;
const passwordMsg = "비밀번호는 8자 이상이며, 특수문자, 영문, 숫자를 모두 포함해야 합니다.";

// 회원가입 유효성 검증 스키마 정의
const RegisterSchema = yup
  .object({
    email: yup.string().matches(emailRegex, emailMsg).required("이메일을 입력하세요."),
    password: yup
      .string()
      .min(8, "비밀번호는 최소 8자 이상이어야 합니다.")
      .max(16, "비밀번호는 최대 16자 이하여야 합니다.")
      .matches(passwordRegex, passwordMsg)
      .required("비밀번호를 입력하세요."),
    name: yup.string().min(2, "이름은 최소 2자 이상이어야 합니다.").required("이름을 입력하세요."),
    birthDate: yup
      .string()
      .required("생년월일은 필수 입력 사항입니다.")
      .matches(/^\d{4}-\d{2}-\d{2}$/, "유효한 날짜 형식(YYYY-MM-DD)을 선택해 주세요."),
    gender: yup.string().oneOf(["MALE", "FEMALE"], "성별을 선택해 주세요.").required("성별은 필수 선택 사항입니다."),
  })
  .required();

const InputField: React.FC<SignUpInputFieldProps> = ({
  label,
  name,
  type = "text",
  placeholder,
  errors,
  register,
  ...rest
}) => {
  // 필드에 에러가 있는지 확인
  const displayError = !!errors[name];
  const borderColorClass = displayError ? "border-red-500" : "border-gray-300";

  return (
    <div className="flex items-center space-x-4">
      <label htmlFor={name} className="flex-shrink-0 w-24 text-sm font-medium text-gray-700">
        {label}
      </label>
      <div className="flex-1">
        <input
          id={name}
          type={type}
          placeholder={placeholder}
          {...register(name)}
          // 에러 유무에 따라 스타일 적용
          className={`w-full px-3 py-2 border ${borderColorClass} "focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500" placeholder-gray-500 text-gray-900 rounded-lg sm:text-sm`}
          {...rest}
        />
        {/* 에러가 존재하는 경우 메시지 표시 */}
        {displayError && <p className="mt-1 text-xs text-red-500">{errors[name]?.message}</p>}
      </div>
    </div>
  );
};

// 회원가입 Error type guard
const isSignUpError = (error: unknown): error is SignUpError => {
  if (typeof error !== "object" || error === null || !("response" in error)) {
    return false;
  }
  const response = (error as SignUpError).response;

  if (typeof response !== "object" || response === null || !("data" in response) || !("status" in response)) {
    return false;
  }

  const data = response.data;
  return typeof data === "object" && data !== null && "message" in data && typeof data.message === "string";
};

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  // API 상태 관리
  const [isSubmitting, setIsSubmitting] = useState(false);
  // 이메일 중복 확인 상태 관리 추가
  const [emailCheckStatus, setEmailCheckStatus] = useState<EmailCheckStatus>("idle");
  const [emailCheckMessage, setEmailCheckMessage] = useState<string | null>(null);

  // useForm 초기화, yupResolver 적용
  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm<RegisterFormData>({
    resolver: yupResolver(RegisterSchema),
    mode: "onSubmit",
  });

  // ------------------------- 필드 에러 상태 확인 변수 -------------------------
  const isEmailError = !!errors.email;
  const isBirthDateError = !!errors.birthDate;
  const isGenderError = !!errors.gender;
  // --------------------------------------------------------------------------

  // 이메일 중복 확인 함수
  const checkEmailDuplication = useCallback(async () => {
    const isEmailValid = await trigger("email");
    if (!isEmailValid) {
      setEmailCheckMessage("유효한 이메일 형식을 먼저 입력해주세요.");
      setEmailCheckStatus("error");
      return;
    }

    setEmailCheckStatus("checking");
    setEmailCheckMessage("이메일 중복 확인 중...");

    try {
      // 중복 확인 Mockup
      await new Promise((resolve) => setTimeout(resolve, 800));

      setEmailCheckStatus("available");
      setEmailCheckMessage("✅ 사용 가능한 이메일입니다.");
    } catch (error) {
      console.error("Email duplication check failed", error);
      setEmailCheckStatus("duplicate");

      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        const result = error.response.data as { message?: string };

        if (status === 409) {
          setEmailCheckMessage(result.message || "이미 사용 중인 이메일입니다.");
        } else {
          setEmailCheckMessage(result.message || `이메일 확인 중 서버 오류가 발생했습니다. (HTTP ${status})`);
        }
      } else if (isSignUpError(error)) {
        if (error.response.status === 409) {
          setEmailCheckMessage(error.response.data.message);
        } else {
          setEmailCheckMessage("알 수 없는 서버 응답 오류가 발생했습니다.");
        }
      } else {
        setEmailCheckMessage("네트워크 오류로 중복 확인에 실패했습니다.");
      }
    }
  }, [trigger]);

  // 유효성 검증 통과 시 실행
  const onSubmit: SubmitHandler<RegisterFormData> = async (data) => {
    if (emailCheckStatus !== "available") {
      setEmailCheckMessage("이메일 중복 확인을 완료하거나, 사용 가능한 이메일로 수정해 주세요.");
      return;
    }

    console.log("회원가입 요청 데이터:", data);
    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      const successMessage = "회원가입이 성공적으로 완료되었습니다. 로그인 페이지로 이동합니다.";
      console.log("회원가입 성공", successMessage);

      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (error) {
      console.error("회원가입 실패", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // --------------------------- 이메일 필드 스타일 계산 ---------------------------
  let emailValidationBorderClass = isEmailError ? "border-red-500" : "border-gray-300";
  let emailStatusClasses = "";

  // 유효성 검사 통과 시 중복 확인 상태에 따른 이메일 입력 필드 스타일 분기 처리
  if (!isEmailError) {
    if (emailCheckStatus === "available") {
      emailStatusClasses = "border-green-500 ring-green-500";
      emailValidationBorderClass = "border-green-500";
    } else if (emailCheckStatus === "duplicate" || emailCheckStatus === "error") {
      emailStatusClasses = "border-red-500 ring-red-500";
      emailValidationBorderClass = "border-red-500";
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <style>{`
        /* 폰트 설정 */
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
        body { font-family: 'Inter', sans-serif; }
        /* 라디오 버튼 포커스 링 스타일 조정 */
        .form-radio:checked {
            border-color: transparent;
            background-color: #dc2626; /* red-600 */
        }
        .form-radio:focus {
            box-shadow: 0 0 0 2px rgba(255, 255, 255, 0), 0 0 0 4px rgba(239, 68, 68, 0.5); /* red-500 ring */
        }
      `}</style>
      <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-2xl space-y-6">
        {/* 뒤로가기 버튼 & 타이틀 */}
        <div className="relative">
          <button
            onClick={() => navigate("/login")}
            className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600 p-1 transition duration-150"
            aria-label="로그인 페이지로 돌아가기"
            disabled={isSubmitting}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
            </svg>
          </button>
          <h2 className="text-3xl font-bold text-center text-red-600">회원가입</h2>
        </div>

        <p className="text-center text-gray-500">맛집 탐방을 위한 새로운 계정을 만들어보세요.</p>

        {/* 회원가입 폼 */}
        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* --------------------------- 이메일 필드 (중복 확인 포함) --------------------------- */}
          <div className="flex items-center space-x-4">
            <label htmlFor="email" className="flex-shrink-0 w-24 text-sm font-medium text-gray-700">
              이메일
            </label>
            <div className="flex-1 flex space-x-2">
              <input
                id="email"
                type="email"
                placeholder="youremail@gmail.com"
                {...register("email", {
                  // 값이 변경될 때마다 중복 상태 초기화
                  onChange: () => {
                    setEmailCheckStatus("idle");
                    setEmailCheckMessage(null);
                  },
                })}
                disabled={isSubmitting || emailCheckStatus === "checking"}
                // 🟢 수정 8: 계산된 클래스를 명확하게 적용. isEmailError에 따라 border 색 결정
                className={`flex-1 px-3 py-2 border ${emailValidationBorderClass} "focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"; placeholder-gray-500 text-gray-900 rounded-lg sm:text-sm ${emailStatusClasses}`}
              />

              <button
                type="button"
                onClick={checkEmailDuplication}
                // 이메일 에러가 있거나, 이미 확인 중이거나, 제출 중이면 비활성화
                disabled={isSubmitting || emailCheckStatus === "checking" || isEmailError}
                className={`
                                  w-24 text-sm font-medium py-2 rounded-lg transition duration-150 
                                  ${
                                    emailCheckStatus === "checking" || isEmailError
                                      ? "bg-gray-300 text-gray-600 cursor-not-allowed"
                                      : "bg-red-500 hover:bg-red-600 text-white shadow-md"
                                  }
                              `}
              >
                {emailCheckStatus === "checking" ? "확인 중" : "중복 확인"}
              </button>
            </div>
          </div>

          {/* 이메일 오류 및 중복 확인 메시지 출력 */}
          <div className="ml-28 -mt-3">
            {/* 🟢 수정 9: isEmailError (유효성 검사 에러)가 있으면 무조건 에러 메시지 표시 */}
            {isEmailError && errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            {/* 유효성 검사 에러가 없을 때만 중복 확인 관련 메시지 표시 */}
            {emailCheckMessage && !isEmailError && (
              <p className={`mt-1 text-xs ${emailCheckStatus === "available" ? "text-green-600" : "text-red-500"}`}>
                {emailCheckMessage}
              </p>
            )}
          </div>
          {/* --------------------------------------------------------------------------------- */}

          {/* 비밀번호 (Input) - InputField 사용 */}
          <InputField
            label="비밀번호"
            name="password"
            type="password"
            placeholder="최소 8자 이상"
            disabled={isSubmitting}
            errors={errors}
            register={register}
          />

          {/* 이름 (Input) - InputField 사용 */}
          <InputField
            label="이름"
            name="name"
            type="text"
            placeholder="닉네임으로 사용될 이름"
            disabled={isSubmitting}
            errors={errors}
            register={register}
          />

          {/* 생년월일 (Input type="date") */}
          <div className="flex items-center space-x-4">
            <label htmlFor="birthDate" className="flex-shrink-0 w-24 text-sm font-medium text-gray-700">
              생년월일
            </label>
            <div className="flex-1">
              <input
                id="birthDate"
                type="date"
                {...register("birthDate")}
                max={new Date().toISOString().split("T")[0]}
                disabled={isSubmitting}
                // 🟢 수정 10: isBirthDateError가 true일 때만 border-red-500 적용
                className={`w-full px-3 py-2 border ${isBirthDateError ? "border-red-500" : "border-gray-300"} "focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"; text-gray-900 rounded-lg sm:text-sm`}
              />
              {isBirthDateError && errors.birthDate && (
                <p className="mt-1 text-xs text-red-500">{errors.birthDate.message}</p>
              )}
            </div>
          </div>

          {/* 성별 (Radio Group) */}
          <div className="flex items-start space-x-4">
            <span className="flex-shrink-0 w-24 text-sm font-medium text-gray-700 pt-2">성별</span>
            <div
              className={`flex space-x-6 pt-2 flex-1 ${isGenderError ? "border border-red-500 p-2 rounded-lg" : ""}`}
            >
              {/* 남자 */}
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  {...register("gender")}
                  value="MALE"
                  disabled={isSubmitting}
                  className="form-radio h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
                />
                <span className="ml-2 text-gray-700">남성</span>
              </label>
              {/* 여자 */}
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  {...register("gender")}
                  value="FEMALE"
                  disabled={isSubmitting}
                  className="form-radio h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
                />
                <span className="ml-2 text-gray-700">여성</span>
              </label>
            </div>
          </div>
          {/* 성별 에러 메시지 별도로 표시 */}
          {isGenderError && errors.gender && (
            <p className="ml-28 -mt-3 text-xs text-red-500">{errors.gender.message}</p>
          )}

          {/* 회원가입 버튼 */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-lg font-bold rounded-lg text-white transition duration-150 transform bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 hover:scale-[1.01]'"
          >
            {isSubmitting ? (
              <div className="flex items-center">
                <svg
                  className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                회원가입 중...
              </div>
            ) : (
              "회원가입 완료"
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
