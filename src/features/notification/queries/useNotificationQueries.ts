/*
  file: useNotificationQueries.ts
  description
  - 헤더 알림 목록, 읽지 않은 개수, 읽음 처리 mutation을 React Query로 관리하는 파일
*/
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  getUnreadNotificationCount,
  getUserNotifications,
  readAllUserNotifications,
  readUserNotification,
} from "../../../api/notification/userNotification.api";
import { notificationQueryKeys } from "./notificationQueryKeys";

export function useUnreadNotificationCountQuery(enabled: boolean) {
  return useQuery({
    queryKey: notificationQueryKeys.unreadCount(),
    queryFn: getUnreadNotificationCount,
    enabled,
  });
}

export function useUserNotificationsQuery(enabled: boolean) {
  return useQuery({
    queryKey: notificationQueryKeys.list(),
    queryFn: getUserNotifications,
    enabled,
  });
}

export function useReadNotificationMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: readUserNotification,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: notificationQueryKeys.list() }),
        queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount() }),
      ]);
    },
  });
}

export function useReadAllNotificationsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: readAllUserNotifications,
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: notificationQueryKeys.list() }),
        queryClient.invalidateQueries({ queryKey: notificationQueryKeys.unreadCount() }),
      ]);
    },
  });
}
