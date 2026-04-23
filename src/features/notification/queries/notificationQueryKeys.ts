/*
  file: notificationQueryKeys.ts
  description
  - 알림 도메인 React Query key를 모아두는 파일
*/
export const notificationQueryKeys = {
  all: ["notifications"] as const,
  list: () => [...notificationQueryKeys.all, "list"] as const,
  unreadCount: () => [...notificationQueryKeys.all, "unread-count"] as const,
};
