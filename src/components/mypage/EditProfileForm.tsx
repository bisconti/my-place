/*
  파일명: EditProfileform.tsx
  describe
  - 프로필 수정 component
*/
import { yupResolver } from "@hookform/resolvers/yup";
import { useEffect, useMemo, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Navigate, useNavigate } from "react-router-dom";

import BackButton from "../form/BackButton";
import { useAuth } from "../../hooks/useAuth";
import { getMyProfile, updateMyProfile } from "../../api/user.api";
import { EditProfileSchema, type EditProfileFormData } from "../../schemas/userSchema";

const EditProfileForm = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors, isDirty },
  } = useForm<EditProfileFormData>({
    resolver: yupResolver(EditProfileSchema),
    mode: "onSubmit",
    defaultValues: {
      nickname: "",
      bio: "",
    },
  });

  useEffect(() => {
    if (!user) return;

    const fetchProfile = async () => {
      setApiError(null);
      setApiSuccess(null);
      setIsLoadingProfile(true);

      try {
        const { data } = await getMyProfile();

        reset({
          nickname: data.nickname ?? "",
          bio: data.bio ?? "",
        });
      } catch (error) {
        console.error("프로필 조회 실패", error);
        setApiError("프로필 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [user, reset]);

  const bioValue = watch("bio") ?? "";
  const bioLen = bioValue.length;

  const onSubmit: SubmitHandler<EditProfileFormData> = async (data) => {
    if (!user) return;

    setIsSubmitting(true);
    setApiError(null);
    setApiSuccess(null);

    try {
      const payload = {
        nickname: data.nickname.trim(),
        bio: data.bio.trim() === "" ? null : data.bio.trim(),
      };

      const { data: result } = await updateMyProfile(payload);

      setApiSuccess(result.message || "프로필이 저장되었습니다.");
      navigate("/mypage");
    } catch (error: unknown) {
      console.error("프로필 수정 실패", error);

      let message = "프로필 저장에 실패했습니다. 다시 시도해주세요.";

      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error &&
        typeof error.response === "object" &&
        error.response !== null &&
        "data" in error.response &&
        typeof error.response.data === "object" &&
        error.response.data !== null &&
        "message" in error.response.data &&
        typeof error.response.data.message === "string"
      ) {
        message = error.response.data.message;
      } else {
        message = "네트워크 연결 또는 서버에 문제가 있습니다.";
      }

      setApiError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleErrorMsg = useMemo(() => {
    const errorKeys = Object.keys(errors);

    if (errorKeys.length > 0) {
      const errorKey = errorKeys[0] as keyof EditProfileFormData;
      return errors[errorKey]?.message;
    }

    return null;
  }, [errors]);

  const pageMsg = handleErrorMsg || apiError || apiSuccess;

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl space-y-6">
        <div className="relative">
          <BackButton path="/mypage" />
          <h2 className="text-3xl font-bold text-center text-red-600">프로필 수정</h2>
        </div>

        <p className="text-center text-gray-500">닉네임과 소개를 변경할 수 있어요.</p>

        {isLoadingProfile ? (
          <div className="py-6">
            <p className="text-sm text-center text-gray-500">프로필 정보를 불러오는 중입니다...</p>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
            {/* 이메일 (변경 불가) */}
            <div className="flex items-center space-x-4">
              <label htmlFor="email" className="flex-shrink-0 w-24 text-sm font-medium text-gray-700">
                이메일
              </label>
              <input
                id="email"
                type="text"
                value={user.useremail ?? ""}
                readOnly
                className="flex-1 px-3 py-2 border border-gray-200 bg-gray-100 text-gray-600 rounded-lg sm:text-sm"
              />
            </div>

            {/* 닉네임 */}
            <div className="flex items-center space-x-4">
              <label htmlFor="nickname" className="flex-shrink-0 w-24 text-sm font-medium text-gray-700">
                닉네임
              </label>
              <input
                id="nickname"
                type="text"
                disabled={isSubmitting}
                {...register("nickname")}
                className={`flex-1 px-3 py-2 border ${
                  errors.nickname || apiError ? "border-red-500" : "border-gray-300"
                } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                placeholder="2~20자"
                autoComplete="off"
              />
            </div>

            {/* 소개 */}
            <div className="flex items-start space-x-4">
              <label htmlFor="bio" className="flex-shrink-0 w-24 text-sm font-medium text-gray-700 pt-2">
                소개
              </label>

              <div className="flex-1">
                <textarea
                  id="bio"
                  disabled={isSubmitting}
                  rows={3}
                  {...register("bio")}
                  className={`w-full px-3 py-2 border ${
                    errors.bio || apiError ? "border-red-500" : "border-gray-300"
                  } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                  placeholder="한 줄 소개(선택)"
                />
                <div className="flex justify-end mt-1">
                  <span className={`text-xs ${bioLen > 80 ? "text-red-500" : "text-gray-400"}`}>{bioLen}/80</span>
                </div>
              </div>
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
                    저장 중...
                  </div>
                ) : (
                  "저장"
                )}
              </button>
            </div>

            <div className="text-center text-xs text-gray-400">닉네임은 서비스 내에서 표시되는 이름이에요.</div>
          </form>
        )}
      </div>
    </div>
  );
};

export default EditProfileForm;
