import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { useEffect, useMemo, useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import * as yup from "yup";
import BackButton from "../form/BackButton";
import { useAuth } from "../../hooks/useAuth";
import { api } from "../../api/api";

type EditProfileFormData = {
  nickname: string;
  bio: string;
};

const EditProfileSchema = yup.object({
  nickname: yup
    .string()
    .required("닉네임을 입력해주세요.")
    .min(2, "닉네임은 최소 2자 이상이어야 합니다.")
    .max(20, "닉네임은 최대 20자까지 가능합니다."),
  bio: yup.string().max(80, "소개는 최대 80자까지 가능합니다.").default(""),
});

type MeResponse = {
  useremail: string;
  nickname: string;
  bio: string | null;
};

type updateMeResponse = {
  message?: string;
  useremail: string;
  nicknmae: string;
  bio: string | null;
};

const EditProfile = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [apiSuccess, setApiSuccess] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setValue,
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

  // 로그인 안 했으면 접근 막기
  useEffect(() => {
    if (!user) {
      navigate("/login");
      return;
    }

    setApiError(null);
    setApiSuccess(null);

    (async () => {
      try {
        const res = await api.get<MeResponse>("/user/me");

        setValue("nickname", res.data.nickname ?? "");
        setValue("bio", res.data.bio ?? "");
      } catch (error) {
        console.error("프로필 조회 실패", error);
        setApiError("프로필 정보를 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
      }
    })();
  }, [user, navigate, setValue]);

  const bioValue = watch("bio") ?? "";
  const bioLen = bioValue.length;

  const onSubmit: SubmitHandler<EditProfileFormData> = async (data) => {
    if (!user) return;

    setIsSubmitting(true);
    setApiError(null);
    setApiSuccess(null);

    try {
      const payload = {
        nickname: data.nickname,
        bio: data.bio?.trim() === "" ? null : data.bio,
      };

      const res = await api.put<updateMeResponse>("/user/me", payload);

      setApiSuccess(res.data.message || "프로필이 저장되었습니다.");

      navigate("/mypage");
    } catch (error) {
      console.error("프로필 수정 실패", error);

      if (axios.isAxiosError(error) && error.response) {
        const result = error.response.data as { message?: string };
        setApiError(result.message || "프로필 저장에 실패했습니다. 다시 시도해주세요.");
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
      const errorKey = errorKeys[0] as keyof EditProfileFormData;
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
          <h2 className="text-3xl font-bold text-center text-red-600">프로필 수정</h2>
        </div>

        <p className="text-center text-gray-500">닉네임과 소개를 변경할 수 있어요.</p>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* 이메일 (변경 불가) */}
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

          {/* 안내 */}
          <div className="text-center text-xs text-gray-400">닉네임은 서비스 내에서 표시되는 이름이에요.</div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
