/*
  file: userNotification.api.ts
  description
  - 사용자 알림 조회 및 읽음 처리 관련 API 함수를 모아둔 파일
*/
import type { UnreadNotificationCountResponse, UserNotification } from "../../types/notification/userNotification.type";
import { api } from "../api";

export const getUserNotifications = async (): Promise<UserNotification[]> => {
  const response = await api.get("/api/notifications");
  return response.data;
};

export const getUnreadNotificationCount = async (): Promise<UnreadNotificationCountResponse> => {
  const response = await api.get("/api/notifications/unread-count");
  return response.data;
};

export const readUserNotification = async (notificationId: number): Promise<void> => {
  await api.put(`/api/notifications/${notificationId}/read`);
};

export const readAllUserNotifications = async (): Promise<void> => {
  await api.put("/api/notifications/read-all");
};
