import type { NotificationSettings } from "../types/settings/userSettings.type";
import { api } from "./api";

/**
 * ============================
 * Query API (조회)
 * ============================
 */

/**
 * 알림 설정 조회
 */
export const getNotificationSettings = async (): Promise<NotificationSettings> => {
  const response = await api.get("/api/user/settings/notifications");
  return response.data;
};

/**
 * ============================
 * Command API (등록/수정)
 * ============================
 */

/**
 * 알림 설정 저장
 */
export const updateNotificationSettings = async (payload: NotificationSettings): Promise<NotificationSettings> => {
  const response = await api.put("/api/user/settings/notifications", payload);
  return response.data;
};
