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
