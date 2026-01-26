import React, { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { useNavigate } from "react-router-dom";
import BackButton from "./form/BackButton";
import { RegisterSchema, type RegisterFormData } from "../schemas/userSchema";
import InputField from "./share/InputField";
import { signUp } from "../api/auth.api";
import { useEmailDuplication } from "../hooks/useEmailDuplication";
import { toast } from "react-toastify";

const SignUp: React.FC = () => {
  const navigate = useNavigate();
  // API 상태 관리
  const [isSubmitting, setIsSubmitting] = useState(false);

  // useForm 초기화, yupResolver 적용
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: yupResolver(RegisterSchema),
    mode: "onSubmit",
  });

  const {
    status: emailCheckStatus,
    message: emailCheckMessage,
    check: checkEmailDuplication,
    setStatus: setEmailCheckStatus,
    setMessage: setEmailCheckMessage,
  } = useEmailDuplication();

  const email = watch("email");

  // ------------------------- 필드 에러 상태 확인 변수 -------------------------
  const isEmailError = !!errors.email;
  const isBirthDateError = !!errors.birthDate;
  const isGenderError = !!errors.gender;
  // --------------------------------------------------------------------------

  // 유효성 검증 통과 시 실행
  const onSubmit: SubmitHandler<RegisterFormData> = async (data) => {
    if (emailCheckStatus !== "available") {
      setEmailCheckMessage("이메일 중복 확인을 완료하거나, 사용 가능한 이메일로 수정해 주세요.");
      return;
    }

    setIsSubmitting(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));

      await signUp(data);

      toast.success("회원가입이 완료되었습니다!");

      navigate("/login");
    } catch (error) {
      toast.error("회원가입에 실패했습니다. 다시 시도해주세요.");
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
          <BackButton path="/login" />
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
                className={`flex-1 px-3 py-2 border ${emailValidationBorderClass} "focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"; placeholder-gray-500 text-gray-900 rounded-lg sm:text-sm ${emailStatusClasses}`}
              />

              <button
                type="button"
                onClick={() => {
                  if (!email) return;
                  checkEmailDuplication(email);
                }}
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
            {isEmailError && errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
            {/* 유효성 검사 에러가 없을 때만 중복 확인 관련 메시지 표시 */}
            {emailCheckMessage && !isEmailError && (
              <p className={`mt-1 text-xs ${emailCheckStatus === "available" ? "text-green-600" : "text-red-500"}`}>
                {emailCheckMessage}
              </p>
            )}
          </div>
          {/* --------------------------------------------------------------------------------- */}

          <InputField
            label="비밀번호"
            name="password"
            type="password"
            placeholder="최소 8자 이상"
            disabled={isSubmitting}
            errors={errors}
            register={register}
          />

          <InputField
            label="이름"
            name="username"
            type="text"
            placeholder="이름"
            disabled={isSubmitting}
            errors={errors}
            register={register}
          />

          <InputField
            label="닉네임"
            name="nickname"
            type="text"
            placeholder="사용할 닉네임"
            disabled={isSubmitting}
            errors={errors}
            register={register}
          />

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
                className={`w-full px-3 py-2 border ${isBirthDateError ? "border-red-500" : "border-gray-300"} "focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500"; text-gray-900 rounded-lg sm:text-sm`}
              />
              {isBirthDateError && errors.birthDate && (
                <p className="mt-1 text-xs text-red-500">{errors.birthDate.message}</p>
              )}
            </div>
          </div>

          <div className="flex items-start space-x-4">
            <span className="flex-shrink-0 w-24 text-sm font-medium text-gray-700 pt-2">성별</span>
            <div
              className={`flex space-x-6 pt-2 flex-1 ${isGenderError ? "border border-red-500 p-2 rounded-lg" : ""}`}
            >
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  {...register("gender")}
                  value="M"
                  disabled={isSubmitting}
                  className="form-radio h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
                />
                <span className="ml-2 text-gray-700">남성</span>
              </label>
              <label className="inline-flex items-center cursor-pointer">
                <input
                  type="radio"
                  {...register("gender")}
                  value="F"
                  disabled={isSubmitting}
                  className="form-radio h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
                />
                <span className="ml-2 text-gray-700">여성</span>
              </label>
            </div>
          </div>
          {isGenderError && errors.gender && (
            <p className="ml-28 -mt-3 text-xs text-red-500">{errors.gender.message}</p>
          )}

          {/* 소개 */}
          <div className="flex items-start space-x-4">
            <label htmlFor="bio" className="flex-shrink-0 w-24 text-sm font-medium text-gray-700 pt-2">
              소개
            </label>

            <div className="flex-1">
              <textarea
                id="bio"
                rows={3}
                {...register("bio")}
                disabled={isSubmitting}
                placeholder="한 줄 소개를 입력해주세요 (선택)"
                className={`w-full px-3 py-2 border ${
                  errors.bio ? "border-red-500" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm`}
              />

              {errors.bio && <p className="mt-1 text-xs text-red-500">{errors.bio.message}</p>}

              <div className="flex justify-end mt-1">
                <span className="text-xs text-gray-400">최대 100자</span>
              </div>
            </div>
          </div>

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
