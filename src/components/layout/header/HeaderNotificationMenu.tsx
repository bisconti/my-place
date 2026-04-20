/*
  file: HeaderNotificationMenu.tsx
  description
  - 헤더의 알림 버튼과 최근 알림 드롭다운 UI를 담당하는 컴포넌트
*/
import type { RefObject } from "react";
import type { UserNotification } from "../../../types/notification/userNotification.type";

type HeaderNotificationMenuProps = {
  notificationRef: RefObject<HTMLDivElement | null>;
  unreadCount: number;
  notifications: UserNotification[];
  isOpen: boolean;
  isLoading: boolean;
  formatDate: (dateString: string) => string;
  onToggle: () => void;
  onReadAll: () => void;
  onClickNotification: (notification: UserNotification) => void;
  onClickViewAll: () => void;
};

const HeaderNotificationMenu = ({
  notificationRef,
  unreadCount,
  notifications,
  isOpen,
  isLoading,
  formatDate,
  onToggle,
  onReadAll,
  onClickNotification,
  onClickViewAll,
}: HeaderNotificationMenuProps) => {
  return (
    <div className="relative" ref={notificationRef}>
      <button
        type="button"
        onClick={() => void onToggle()}
        className="relative flex items-center justify-center w-10 h-10 rounded-full border border-gray-200 bg-white text-gray-600 hover:text-red-600 hover:bg-gray-50 transition"
        aria-label="알림"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V4a2 2 0 10-4 0v1.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0a3 3 0 11-6 0m6 0H9"
          />
        </svg>

        {unreadCount > 0 && <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-red-500" />}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-96 max-w-[90vw] bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50">
          <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
            <div>
              <p className="text-sm font-semibold text-gray-900">알림</p>
              <p className="text-xs text-gray-500">최근 알림을 확인해보세요.</p>
            </div>

            {notifications.length > 0 && unreadCount > 0 && (
              <button
                type="button"
                onClick={() => void onReadAll()}
                className="text-xs font-medium text-red-600 hover:text-red-700"
              >
                전체 읽음
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <div className="px-4 py-8 text-sm text-center text-gray-500">알림을 불러오는 중입니다...</div>
            ) : notifications.length === 0 ? (
              <div className="px-4 py-8 text-sm text-center text-gray-500">아직 알림이 없습니다.</div>
            ) : (
              notifications.slice(0, 5).map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => void onClickNotification(notification)}
                  className={`w-full text-left px-4 py-4 border-b last:border-b-0 hover:bg-gray-50 transition ${
                    notification.isRead ? "bg-white" : "bg-red-50/40"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-semibold text-gray-900 truncate">{notification.title}</p>
                        {!notification.isRead && <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />}
                      </div>

                      <p className="mt-1 text-sm text-gray-600 line-clamp-2">{notification.content}</p>
                    </div>

                    <span className="text-xs text-gray-400 shrink-0">{formatDate(notification.createdAt)}</span>
                  </div>
                </button>
              ))
            )}
          </div>

          {notifications.length > 5 && (
            <div className="px-4 py-3 border-t bg-gray-50">
              <button
                type="button"
                onClick={onClickViewAll}
                className="w-full text-sm font-medium text-gray-700 hover:text-red-600"
              >
                전체 알림 보기
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default HeaderNotificationMenu;
