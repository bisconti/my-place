import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import React, { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../contexts/useAuth";
import BackButton from "../form/BackButton";
import { LoginSchema, type LoginFormData } from "../../schemas/authSchema";

const Login = () => {
  const navigate = useNavigate();
  const { login } = useAuth();

  // API 상태 관리
  const [isSubmitting, setIsSubmitting] = useState(false);
  // API 인증 오류 메시지 관리
  const [authError, setAuthError] = useState<string | null>(null);

  // useForm 초기화, yupResolver 적용
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(LoginSchema),
    mode: "onSubmit",
  });

  // 유효성 검증 통과 시 실행
  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    console.log(data);
    setIsSubmitting(true);
    setAuthError(null); // 기존 API 오류 초기화
    try {
      const res = await axios.post("auth/login", data);
      console.log(res.data);
      // 로그인 성공 시 Context의 login 함수를 사용하여 상태 업데이트 및 localStroage에 저장
      const { user, token, refreshToken } = res.data;
      login(user, token);

      localStorage.setItem("token", token);
      if (refreshToken) {
        localStorage.setItem("refreshToken", refreshToken);
      }
      navigate("/");
    } catch (error) {
      console.error("로그인 실패", error);

      if (axios.isAxiosError(error) && error.response) {
        const result = error.response.data as { message?: string };
        setAuthError(result.message || "로그인에 실패했습니다.");
      } else {
        setAuthError("네트워크 연결 또는 서버에 문제가 있습니다.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // error message control
  const handleErrorMsg = React.useMemo(() => {
    const errorKeys = Object.keys(errors);

    if (errorKeys.length > 0) {
      const errorKey = errorKeys[0] as keyof LoginFormData;
      return errors[errorKey]?.message;
    }
    return null;
  }, [errors]);

  const loginErrorMsg = handleErrorMsg || authError;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl space-y-6">
        <div className="relative">
          <BackButton path="/" />
          <h2 className="text-3xl font-bold text-center text-red-600">로그인</h2>
        </div>

        <p className="text-center text-gray-500">맛집 탐방을 시작해 보세요.</p>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="flex items-center space-x-4">
            <label htmlFor="email" className="flex-shrink-0 w-24 text-sm font-medium text-gray-700">
              이메일 주소
            </label>
            <input
              id="email"
              type="text"
              autoComplete="off"
              disabled={isSubmitting}
              {...register("email")}
              className={`flex-1 px-3 py-2 border ${errors.email || authError ? "border-red-500" : "border-gray-300"} placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm`}
              placeholder="youremail@gmail.com"
            />
          </div>

          <div className="flex items-center space-x-4">
            <label htmlFor="password" className="flex-shrink-0 w-24 text-sm font-medium text-gray-700">
              비밀번호
            </label>
            <input
              id="password"
              type="password"
              disabled={isSubmitting}
              {...register("password")}
              className={`flex-1 px-3 py-2 border ${errors.password || authError ? "border-red-500" : "border-gray-300"} placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm`}
              placeholder="비밀번호"
            />
          </div>

          {/* 유효성 검증 오류 메시지 표시 */}
          {loginErrorMsg && (
            <div className="pt-2">
              <p className="text-xs text-red-500 text-center w-full">{loginErrorMsg}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150"
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
                로그인 중...
              </div>
            ) : (
              "로그인"
            )}
          </button>
        </form>

        <div className="flex justify-between items-center text-sm">
          <Link to="/signup" className="font-medium text-gray-500 hover:text-red-500">
            회원가입
          </Link>
          <Link to="/find-password" className="font-medium text-red-600 hover:text-red-500">
            비밀번호 찾기
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Login;
