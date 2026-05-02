/*
  file: useHeaderNotifications.ts
  description
  - 헤더 알림 드롭다운의 열림 상태와 React Query 기반 조회/읽음 처리를 담당하는 훅
*/
import { useCallback, useMemo, useRef, useState } from "react";
import { APP_MESSAGES } from "../constants/messages";
import {
  useReadAllNotificationsMutation,
  useReadNotificationMutation,
  useUnreadNotificationCountQuery,
  useUserNotificationsQuery,
} from "../features/notification/queries/useNotificationQueries";
import { getPlaceDetail } from "../api/place/place.api";
import { useAuthStore } from "../stores/authStore";
import { handleAppError } from "../utils/appError";
import type { UserNotification } from "../types/notification/userNotification.type";

function formatNotificationDate(dateString: string) {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

type HeaderNotificationActions = {
  onOpenLogin: () => void;
  onOpenNotificationPage: () => void;
  onOpenFallbackPage: () => void;
  onNavigateToPlace: (placeId: string, place: Awaited<ReturnType<typeof getPlaceDetail>>) => void;
  onError: (message: string) => void;
};

export function useHeaderNotifications(actions: HeaderNotificationActions) {
  const user = useAuthStore((state) => state.user);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const notificationRef = useRef<HTMLDivElement | null>(null);

  const unreadCountQuery = useUnreadNotificationCountQuery(!!user);
  const notificationsQuery = useUserNotificationsQuery(!!user && isNotificationOpen);
  const readNotificationMutation = useReadNotificationMutation();
  const readAllMutation = useReadAllNotificationsMutation();

  const unreadCount = unreadCountQuery.data?.unreadCount ?? 0;
  const isNotificationLoading =
    notificationsQuery.isLoading || readNotificationMutation.isPending || readAllMutation.isPending;

  const toggleNotifications = useCallback(async () => {
    if (!user) {
      actions.onOpenLogin();
      return;
    }

    setIsNotificationOpen((prev) => !prev);
  }, [actions, user]);

  const openAllNotificationsPage = useCallback(() => {
    setIsNotificationOpen(false);
    actions.onOpenNotificationPage();
  }, [actions]);

  const handleNotificationClick = useCallback(
    async (notification: UserNotification) => {
      try {
        if (!notification.isRead) {
          await readNotificationMutation.mutateAsync(notification.id);
        }

        setIsNotificationOpen(false);

        if (notification.targetType === "PLACE" && notification.targetId) {
          const place = await getPlaceDetail(notification.targetId);
          actions.onNavigateToPlace(notification.targetId, place);
          return;
        }

        actions.onOpenFallbackPage();
      } catch (error) {
        actions.onError(
          handleAppError(error, {
            fallbackMessage: APP_MESSAGES.header.notificationActionFailed,
            logLabel: "알림 읽음 처리 실패",
          })
        );
      }
    },
    [actions, readNotificationMutation]
  );

  const handleReadAllNotifications = useCallback(async () => {
    try {
      await readAllMutation.mutateAsync();
    } catch (error) {
      actions.onError(
        handleAppError(error, {
          fallbackMessage: APP_MESSAGES.header.notificationActionFailed,
          logLabel: "전체 알림 읽음 처리 실패",
        })
      );
    }
  }, [actions, readAllMutation]);

  return useMemo(
    () => ({
      notificationRef,
      unreadCount,
      notifications: notificationsQuery.data ?? [],
      isNotificationOpen,
      isNotificationLoading,
      formatNotificationDate,
      setIsNotificationOpen,
      toggleNotifications,
      openAllNotificationsPage,
      handleNotificationClick,
      handleReadAllNotifications,
    }),
    [
      unreadCount,
      notificationsQuery.data,
      isNotificationOpen,
      isNotificationLoading,
      toggleNotifications,
      openAllNotificationsPage,
      handleNotificationClick,
      handleReadAllNotifications,
    ]
  );
}
