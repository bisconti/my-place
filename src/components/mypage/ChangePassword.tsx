import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { useMemo, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import BackButton from "../form/BackButton";
import { useAuth } from "../../hooks/useAuth";
import { api } from "../../api/api";
import { ChangePasswordSchema, type ChangePasswordFormData } from "../../schemas/userSchema";
import toast from "react-hot-toast";

type ChangePasswordResponse = {
  message: string;
};

const ChangePassword = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm<ChangePasswordFormData>({
    resolver: yupResolver(ChangePasswordSchema),
    mode: "onSubmit",
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onSubmit: SubmitHandler<ChangePasswordFormData> = async (data) => {
    if (!user) return;

    setIsSubmitting(true);
    setApiError(null);
    setApiSuccess(null);

    try {
      const payload = {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      };

      const res = await api.put<ChangePasswordResponse>("/user/me/password", payload);

      setApiSuccess(res.data.message);

      // 보안상 입력값 초기화
      reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      toast.success("비밀번호가 변경 되었습니다.");
      navigate("/mypage");
    } catch (error) {
      console.error("비밀번호 변경 실패", error);

      if (axios.isAxiosError(error) && error.response) {
        const result = error.response.data as { message?: string };
        setApiError(result.message || "비밀번호 변경에 실패했습니다. 다시 시도해주세요.");
      } else {
        setApiError("네트워크 연결 또는 서버에 문제가 있습니다.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleErrorMsg = useMemo(() => {
    const errorKeys = Object.keys(errors);
    if (errorKeys.length > 0) {
      const errorKey = errorKeys[0] as keyof ChangePasswordFormData;
      return errors[errorKey]?.message;
    }
    return null;
  }, [errors]);

  const pageMsg = handleErrorMsg || apiError || apiSuccess;

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl space-y-6">
        <div className="relative">
          <BackButton path="/mypage" />
          <h2 className="text-3xl font-bold text-center text-red-600">비밀번호 변경</h2>
        </div>

        <p className="text-center text-gray-500">현재 비밀번호를 확인한 후 새 비밀번호로 변경합니다.</p>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* 이메일(표시만) */}
          <div className="flex items-center space-x-4">
            <label htmlFor="email" className="flex-shrink-0 w-24 text-sm font-medium text-gray-700">
              이메일
            </label>
            <input
              id="email"
              type="text"
              value={user?.useremail ?? ""}
              readOnly
              className="flex-1 px-3 py-2 border border-gray-200 bg-gray-100 text-gray-600 rounded-lg sm:text-sm"
            />
          </div>

          {/* 현재 비밀번호 */}
          <div className="flex items-center space-x-4">
            <label htmlFor="currentPassword" className="flex-shrink-0 w-24 text-sm font-medium text-gray-700">
              현재 비밀번호
            </label>
            <input
              id="currentPassword"
              type="password"
              disabled={isSubmitting}
              autoComplete="current-password"
              {...register("currentPassword")}
              className={`flex-1 px-3 py-2 border ${
                errors.currentPassword || apiError ? "border-red-500" : "border-gray-300"
              } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm`}
              placeholder="현재 비밀번호"
            />
          </div>

          {/* 새 비밀번호 */}
          <div className="flex items-center space-x-4">
            <label htmlFor="newPassword" className="flex-shrink-0 w-24 text-sm font-medium text-gray-700">
              새 비밀번호
            </label>
            <input
              id="newPassword"
              type="password"
              disabled={isSubmitting}
              autoComplete="new-password"
              {...register("newPassword")}
              className={`flex-1 px-3 py-2 border ${
                errors.newPassword || apiError ? "border-red-500" : "border-gray-300"
              } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm`}
              placeholder="영문+숫자 포함 8자 이상"
            />
          </div>

          {/* 새 비밀번호 확인 */}
          <div className="flex items-center space-x-4">
            <label htmlFor="confirmPassword" className="flex-shrink-0 w-24 text-sm font-medium text-gray-700">
              확인
            </label>
            <input
              id="confirmPassword"
              type="password"
              disabled={isSubmitting}
              autoComplete="new-password"
              {...register("confirmPassword")}
              className={`flex-1 px-3 py-2 border ${
                errors.confirmPassword || apiError ? "border-red-500" : "border-gray-300"
              } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm`}
              placeholder="새 비밀번호 재입력"
            />
          </div>

          {/* 메시지 */}
          {pageMsg && (
            <div className="pt-2">
              <p className={`text-xs text-center w-full ${apiSuccess ? "text-green-600" : "text-red-500"}`}>
                {pageMsg}
              </p>
            </div>
          )}

          {/* 버튼들 */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate("/mypage")}
              disabled={isSubmitting}
              className="w-full py-2 px-4 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition disabled:cursor-not-allowed"
            >
              취소
            </button>

            <button
              type="submit"
              disabled={isSubmitting || !isDirty}
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
                "변경"
              )}
            </button>
          </div>

          {/* 안내 */}
          <div className="text-center text-xs text-gray-400">비밀번호는 주기적으로 변경하는 것을 권장합니다.</div>
        </form>
      </div>
    </div>
  );
};

export default ChangePassword;
