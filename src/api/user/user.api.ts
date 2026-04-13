/*
  파일명: user.api.ts
  기능 
  - 로그인 사용자의 내 프로필 조회, 정보 수정 등 관련 API 요청 모음
*/
import { api } from "../api";
import type { MyProfileResponse, UpdateMyProfileRequest } from "../../types/user/user.types";

// 내 프로필 조회
export const getMyProfile = () => api.get<MyProfileResponse>("/user/me");

// 내 프로필 수정
export const updateMyProfile = (data: UpdateMyProfileRequest) =>
  api.put<MyProfileResponse & { message?: string }>("/user/me", data);
