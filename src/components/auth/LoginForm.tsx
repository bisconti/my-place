/*
  file: LoginForm.tsx
  description
  - 로그인 폼 입력과 인증 실패 안내, 전역 인증 상태 반영을 담당하는 컴포넌트
*/
import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { useMemo, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom";
import { APP_MESSAGES } from "../../constants/messages";
import { useAuth } from "../../hooks/useAuth";
import { LoginSchema, type LoginFormData } from "../../schemas/authSchema";
import { handleAppError } from "../../utils/appError";
import { signIn } from "../../api/user/auth.api";
import BackButton from "../form/BackButton";

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: yupResolver(LoginSchema),
    mode: "onSubmit",
  });

  const onSubmit: SubmitHandler<LoginFormData> = async (data) => {
    setIsSubmitting(true);
    setAuthError(null);

    try {
      const response = await signIn(data);
      const { user, token } = response.data;

      login(user, token);
      navigate("/");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        const result = error.response.data as { message?: string };
        setAuthError(result.message || APP_MESSAGES.auth.loginFailed);
      } else {
        setAuthError(
          handleAppError(error, {
            fallbackMessage: APP_MESSAGES.auth.networkError,
            logLabel: "로그인 실패",
          })
        );
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const validationError = useMemo(() => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length === 0) return null;

    const firstErrorKey = errorKeys[0] as keyof LoginFormData;
    return errors[firstErrorKey]?.message ?? null;
  }, [errors]);

  const loginErrorMessage = validationError || authError;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl space-y-6">
        <div className="relative">
          <BackButton path="/" />
          <h2 className="text-3xl font-bold text-center text-red-600">{APP_MESSAGES.auth.loginTitle}</h2>
        </div>

        <p className="text-center text-gray-500">{APP_MESSAGES.auth.loginSubtitle}</p>

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
              className={`flex-1 px-3 py-2 border ${
                errors.email || authError ? "border-red-500" : "border-gray-300"
              } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm`}
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
              className={`flex-1 px-3 py-2 border ${
                errors.password || authError ? "border-red-500" : "border-gray-300"
              } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm`}
              placeholder="비밀번호"
            />
          </div>

          {loginErrorMessage && (
            <div className="pt-2">
              <p className="text-xs text-red-500 text-center w-full">{loginErrorMessage}</p>
            </div>
          )}

          <button
            type="submit"
            disabled={isSubmitting}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150"
          >
            {isSubmitting ? "로그인 중..." : APP_MESSAGES.auth.loginTitle}
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

export default LoginForm;
