/*
  file: useHeaderNotifications.ts
  description
  - 헤더 알림 드롭다운의 조회, 읽음 처리, 열림 상태를 관리하는 훅
*/
import { useCallback, useEffect, useRef, useState } from "react";
import {
  getUnreadNotificationCount,
  getUserNotifications,
  readAllUserNotifications,
  readUserNotification,
} from "../api/notification/userNotification.api";
import { getPlaceDetail } from "../api/place/place.api";
import { useAuthStore } from "../stores/authStore";
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

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isNotificationLoading, setIsNotificationLoading] = useState(false);

  const notificationRef = useRef<HTMLDivElement | null>(null);

  const fetchUnreadCount = useCallback(async () => {
    if (!user) {
      setUnreadCount(0);
      return;
    }

    try {
      const data = await getUnreadNotificationCount();
      setUnreadCount(data.unreadCount);
    } catch (error) {
      console.error("읽지 않은 알림 개수 조회 실패", error);
    }
  }, [user]);

  const fetchNotifications = useCallback(async () => {
    if (!user) {
      setNotifications([]);
      return;
    }

    try {
      setIsNotificationLoading(true);
      const data = await getUserNotifications();
      setNotifications(data);
    } catch (error) {
      console.error("알림 목록 조회 실패", error);
    } finally {
      setIsNotificationLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (!user) {
      setUnreadCount(0);
      setNotifications([]);
      setIsNotificationOpen(false);
      return;
    }

    void fetchUnreadCount();
  }, [fetchUnreadCount, user]);

  const toggleNotifications = useCallback(async () => {
    if (!user) {
      actions.onOpenLogin();
      return;
    }

    const nextOpen = !isNotificationOpen;
    setIsNotificationOpen(nextOpen);

    if (nextOpen) {
      await Promise.all([fetchNotifications(), fetchUnreadCount()]);
    }
  }, [actions, fetchNotifications, fetchUnreadCount, isNotificationOpen, user]);

  const openAllNotificationsPage = () => {
    setIsNotificationOpen(false);
    actions.onOpenNotificationPage();
  };

  const handleNotificationClick = useCallback(
    async (notification: UserNotification) => {
      try {
        if (!notification.isRead) {
          await readUserNotification(notification.id);

          setNotifications((prev) =>
            prev.map((item) =>
              item.id === notification.id ? { ...item, isRead: true, readAt: new Date().toISOString() } : item
            )
          );
          setUnreadCount((prev) => Math.max(0, prev - 1));
        }

        setIsNotificationOpen(false);

        if (notification.targetType === "PLACE" && notification.targetId) {
          const place = await getPlaceDetail(notification.targetId);
          actions.onNavigateToPlace(notification.targetId, place);
          return;
        }

        actions.onOpenFallbackPage();
      } catch (error) {
        console.error("알림 읽음 처리 실패", error);
        actions.onError("알림 처리에 실패했습니다.");
      }
    },
    [actions]
  );

  const handleReadAllNotifications = useCallback(async () => {
    try {
      await readAllUserNotifications();

      setNotifications((prev) =>
        prev.map((item) => ({
          ...item,
          isRead: true,
          readAt: item.readAt ?? new Date().toISOString(),
        }))
      );
      setUnreadCount(0);
    } catch (error) {
      console.error("전체 알림 읽음 처리 실패", error);
      actions.onError("전체 읽음 처리에 실패했습니다.");
    }
  }, [actions]);

  return {
    notificationRef,
    unreadCount,
    notifications,
    isNotificationOpen,
    isNotificationLoading,
    formatNotificationDate,
    setIsNotificationOpen,
    toggleNotifications,
    openAllNotificationsPage,
    handleNotificationClick,
    handleReadAllNotifications,
  };
}
