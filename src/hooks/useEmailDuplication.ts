/*
  파일명: useEmailDuplication.ts
  기능 
  - 이메일 중복 체크
*/
import { useState, useCallback } from "react";
import axios from "axios";
import type { EmailCheckStatus } from "../types/user/user.types";

export const useEmailDuplication = () => {
  const [status, setStatus] = useState<EmailCheckStatus>("idle");
  const [message, setMessage] = useState<string | null>(null);

  const check = useCallback(async (email: string) => {
    setStatus("checking");
    setMessage("이메일 중복 확인 중...");

    try {
      const res = await axios.post("/auth/checkEmailDup", { email });
      setStatus("available");
      setMessage(res.data.message);
    } catch (error: unknown) {
      if (axios.isAxiosError(error)) {
        setStatus("duplicate");
        setMessage(error.response?.data?.message ?? "이미 사용 중인 이메일입니다.");
      } else {
        setStatus("error");
        setMessage("알 수 없는 오류가 발생했습니다.");
      }
    }
  }, []);

  return { status, message, check, setStatus, setMessage };
};
