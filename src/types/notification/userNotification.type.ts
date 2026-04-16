/*
  file: userNotification.type.ts
  description
  - 사용자 알림 도메인 데이터 타입을 정의하는 파일
*/
export interface UserNotification {
  id: number;
  userEmail: string;
  notificationType: string;
  title: string;
  content: string;
  targetId?: string;
  targetType?: string;
  isRead: boolean;
  createdAt: string;
  readAt?: string;
}

export interface UnreadNotificationCountResponse {
  unreadCount: number;
}
