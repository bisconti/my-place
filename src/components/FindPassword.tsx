import { yupResolver } from "@hookform/resolvers/yup";
import axios from "axios";
import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import BackButton from "./form/BackButton";
import { FindPasswordSchema } from "../schemas/userSchema";

interface FindPasswordFormData {
  email: string;
}

const FindPassword = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiMessage, setApiMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FindPasswordFormData>({
    resolver: yupResolver(FindPasswordSchema),
    mode: "onSubmit",
  });

  const onSubmit: SubmitHandler<FindPasswordFormData> = async (data) => {
    setIsSubmitting(true);
    setApiMessage(null);

    try {
      await axios.post("/auth/find-password", data);

      // 보안상 성공/실패 여부를 명확히 구분하지 않는 것이 일반적
      setIsSuccess(true);
      setApiMessage("입력하신 이메일로 비밀번호 재설정 안내 메일을 발송했습니다.");
    } catch (error) {
      console.error(error);
      setApiMessage("입력하신 이메일로 비밀번호 재설정 안내 메일을 발송했습니다.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
      <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl space-y-6">
        <div className="relative">
          <BackButton path="/login" />
          <h2 className="text-3xl font-bold text-center text-red-600">비밀번호 찾기</h2>
        </div>

        <p className="text-center text-gray-500 text-sm">
          가입 시 사용한 이메일 주소를 입력하시면
          <br />
          비밀번호 재설정 안내 메일을 보내드립니다.
        </p>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
          <div className="flex items-center space-x-4">
            <label htmlFor="email" className="flex-shrink-0 w-24 text-sm font-medium text-gray-700">
              이메일 주소
            </label>
            <input
              id="email"
              type="email"
              disabled={isSubmitting || isSuccess}
              {...register("email")}
              className={`flex-1 px-3 py-2 border ${
                errors.email ? "border-red-500" : "border-gray-300"
              } placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm`}
              placeholder="youremail@gmail.com"
            />
          </div>

          {errors.email && <p className="text-xs text-red-500 text-center">{errors.email.message}</p>}

          {apiMessage && (
            <p className={`text-xs text-center ${isSuccess ? "text-green-600" : "text-red-500"}`}>{apiMessage}</p>
          )}

          <button
            type="submit"
            disabled={isSubmitting || isSuccess}
            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150"
          >
            {isSubmitting ? "메일 발송 중..." : "비밀번호 재설정 메일 보내기"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default FindPassword;
