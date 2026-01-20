import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate, useSearchParams } from "react-router-dom";
import BackButton from "./form/BackButton";
import { ResetPasswordSchema, type ResetPasswordFormData } from "../schemas/userSchema";
import { toast } from "react-toastify";

const ResetPassword = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  // API 상태
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [tokenError, setTokenError] = useState<string | null>(null);
  const [isTokenChecking, setIsTokenChecking] = useState(true);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordFormData>({
    resolver: yupResolver(ResetPasswordSchema),
    mode: "onSubmit",
  });

  // 토큰 기본 체크 + (선택) 서버 검증 자리
  useEffect(() => {
    setApiError(null);
    setTokenError(null);

    if (!token) {
      setTokenError("유효하지 않은 재설정 링크입니다. 메일을 다시 요청해주세요.");
      setIsTokenChecking(false);
      return;
    }

    // 토큰 검증
    axios
      .get("/auth/reset-password/validate", { params: { token } })
      .then(() => setIsTokenChecking(false))
      .catch((err) => {
        const msg =
          axios.isAxiosError(err) && err.response?.data?.message
            ? err.response.data.message
            : "재설정 링크가 만료되었거나 유효하지 않습니다.";

        setTokenError(msg);
        setIsTokenChecking(false);
      });
  }, [token]);

  const onSubmit: SubmitHandler<ResetPasswordFormData> = async (data) => {
    if (!token) {
      setTokenError("유효하지 않은 재설정 링크입니다. 메일을 다시 요청해주세요.");
      return;
    }

    setIsSubmitting(true);
    setApiError(null);

    try {
      await axios.post("/auth/reset-password", {
        token,
        newPassword: data.password,
      });

      toast.success("비밀번호 변경이 완료되었습니다");
      navigate("/login");
    } catch (error) {
      console.error("비밀번호 재설정 실패", error);

      if (axios.isAxiosError(error) && error.response) {
        const status = error.response.status;
        const result = error.response.data as { message?: string };

        // 백엔드에서 token 만료/사용됨 등을 400/401/404로 내려줄 때 대응
        if (status === 400 || status === 401 || status === 404) {
          setApiError(result.message || "재설정 링크가 만료되었거나 유효하지 않습니다.");
        } else {
          setApiError(result.message || "비밀번호 변경에 실패했습니다. 다시 시도해주세요.");
        }
      } else {
        setApiError("네트워크 연결 또는 서버에 문제가 있습니다.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // Login과 동일한 “첫 에러 메시지” 방식
  const handleErrorMsg = useMemo(() => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      const errorKey = errorKeys[0] as keyof ResetPasswordFormData;
      return errors[errorKey]?.message;
    }
    return null;
  }, [errors]);

  const pageErrorMsg = tokenError || handleErrorMsg || apiError;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl space-y-6">
        <div className="relative">
          <BackButton path="/login" />
          <h2 className="text-3xl font-bold text-center text-red-600">비밀번호 재설정</h2>
        </div>

        <p className="text-center text-gray-500">새 비밀번호를 입력해주세요.</p>

        {isTokenChecking ? (
          <div className="py-6">
            <p className="text-sm text-gray-500 text-center">링크를 확인하는 중입니다...</p>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            <div className="flex items-center space-x-4">
              <label htmlFor="password" className="flex-shrink-0 w-24 text-sm font-medium text-gray-700">
                새 비밀번호
              </label>
              <input
                id="password"
                type="password"
                disabled={isSubmitting || !!tokenError}
                {...register("password")}
                className={`flex-1 px-3 py-2 border ${
                  errors.password || apiError || tokenError ? "border-red-500" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                placeholder="8자 이상"
              />
            </div>

            <div className="flex items-center space-x-4">
              <label htmlFor="confirmPassword" className="flex-shrink-0 w-24 text-sm font-medium text-gray-700">
                비밀번호 확인
              </label>
              <input
                id="confirmPassword"
                type="password"
                disabled={isSubmitting || !!tokenError}
                {...register("confirmPassword")}
                className={`flex-1 px-3 py-2 border ${
                  errors.confirmPassword || apiError || tokenError ? "border-red-500" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                placeholder="비밀번호 재입력"
              />
            </div>

            {/* 오류 메시지 (Login과 동일한 위치/스타일) */}
            {pageErrorMsg && (
              <div className="pt-2">
                <p className="text-xs text-red-500 text-center w-full">{pageErrorMsg}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting || !!tokenError}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150"
            >
              {isSubmitting ? (
                <div className="flex items-center">
                  <svg
                    className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  변경 중...
                </div>
              ) : (
                "비밀번호 변경"
              )}
            </button>

            {/* 토큰이 잘못된 경우 보조 안내 */}
            {!!tokenError && (
              <div className="text-center text-sm text-gray-500">비밀번호 찾기 페이지에서 다시 요청해주세요.</div>
            )}
          </form>
        )}
      </div>
    </div>
  );
};

export default ResetPassword;
