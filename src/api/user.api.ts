import { http } from "./http";

export type MyProfileResponse = {
  useremail: string;
  nickname: string;
  bio: string | null;
};

export type UpdateMyProfileRequest = {
  nickname: string;
  bio: string | null;
};

export const getMyProfile = () => http.get<MyProfileResponse>("/user/me");

export const updateMyProfile = (data: UpdateMyProfileRequest) =>
  http.put<MyProfileResponse & { message?: string }>("/user/me", data);
