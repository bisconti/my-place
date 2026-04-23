/*
  file: Header.tsx
  description
  - 전역 헤더에서 검색, 알림, 인증 상태, 세션 안내를 조합해 보여주는 레이아웃 컴포넌트
*/
import { useEffect } from "react";
import toast from "react-hot-toast";
import { useLocation, useNavigate } from "react-router-dom";
import { APP_MESSAGES } from "../../constants/messages";
import { useHeaderNotifications } from "../../hooks/useHeaderNotifications";
import { useHeaderPlaceSearch } from "../../hooks/useHeaderPlaceSearch";
import { useSessionCountdown } from "../../hooks/useSessionCountdown";
import { useAuthStore } from "../../stores/authStore";
import { handleAppError } from "../../utils/appError";
import { signOut } from "../../api/user/auth.api";
import HeaderAuthSection from "./header/HeaderAuthSection";
import HeaderNotificationMenu from "./header/HeaderNotificationMenu";
import HeaderSearchBar from "./header/HeaderSearchBar";

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const user = useAuthStore((state) => state.user);
  const logout = useAuthStore((state) => state.logout);
  const { timeText, touchActivity, isExpired } = useSessionCountdown();

  const notifications = useHeaderNotifications({
    onOpenLogin: () => navigate("/login"),
    onOpenNotificationPage: () => navigate("/mypage/notifications"),
    onOpenFallbackPage: () => navigate("/mypage"),
    onNavigateToPlace: (placeId, place) => {
      navigate(`/places/${placeId}`, {
        state: { place },
      });
    },
    onError: (message) => toast.error(message),
  });

  const search = useHeaderPlaceSearch({
    onNavigateToPlace: (placeId, place) => {
      navigate(`/places/${placeId}`, {
        state: { place },
      });
    },
    onError: (message) => toast.error(message),
    onEmptyResult: (message) => toast(message),
  });

  useEffect(() => {
    if (!user) return;
    touchActivity();
  }, [location.pathname, touchActivity, user]);

  useEffect(() => {
    if (!user || !isExpired) return;

    toast.error(APP_MESSAGES.auth.sessionExpired);
    navigate("/login");
  }, [isExpired, navigate, user]);

  useEffect(() => {
    const { notificationRef, setIsNotificationOpen } = notifications;
    const { searchRef, setIsSearchOpen } = search;

    const handleClickOutside = (event: MouseEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setIsNotificationOpen(false);
      }

      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
      }
    };

    window.addEventListener("mousedown", handleClickOutside);
    return () => window.removeEventListener("mousedown", handleClickOutside);
  }, [notifications, search]);

  const handleLogout = async () => {
    try {
      await signOut(user?.useremail);
    } catch (error) {
      handleAppError(error, {
        fallbackMessage: APP_MESSAGES.auth.logoutSuccess,
        logLabel: "로그아웃 API 실패",
      });
    } finally {
      logout({ silent: false, reason: "manual" });
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 items-center h-16 gap-4">
          <div className="justify-self-start">
            <a href="/" className="text-2xl font-bold text-red-600 hover:text-red-700">
              {APP_MESSAGES.header.brandName}
            </a>
          </div>

          <HeaderSearchBar
            searchRef={search.searchRef}
            searchKeyword={search.searchKeyword}
            suggestions={search.suggestions}
            isSearchOpen={search.isSearchOpen}
            isSearchLoading={search.isSearchLoading}
            onChangeKeyword={search.setSearchKeyword}
            onOpenSuggestions={() => search.setIsSearchOpen(true)}
            onSelectSuggestion={search.handleSelectSuggestion}
            onSubmit={search.handleSubmitSearch}
            onClose={() => search.setIsSearchOpen(false)}
          />

          <div className="justify-self-end flex items-center gap-3">
            <HeaderAuthSection
              user={user}
              timeText={timeText}
              onLogin={() => navigate("/login")}
              onLogout={() => void handleLogout()}
            />

            <div className="flex items-center gap-2">
              {user && (
                <HeaderNotificationMenu
                  notificationRef={notifications.notificationRef}
                  unreadCount={notifications.unreadCount}
                  notifications={notifications.notifications}
                  isOpen={notifications.isNotificationOpen}
                  isLoading={notifications.isNotificationLoading}
                  formatDate={notifications.formatNotificationDate}
                  onToggle={notifications.toggleNotifications}
                  onReadAll={notifications.handleReadAllNotifications}
                  onClickNotification={notifications.handleNotificationClick}
                  onClickViewAll={notifications.openAllNotificationsPage}
                  onClose={() => notifications.setIsNotificationOpen(false)}
                />
              )}

              <button
                type="button"
                className="text-gray-600 hover:text-red-600 focus:outline-none"
                aria-label="사용자 메뉴"
                onClick={() => {
                  if (!user) {
                    navigate("/login");
                    return;
                  }

                  navigate("/mypage");
                }}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14c-4.418 0-8 3.582-8 8h16c0-4.418-3.582-8-8-8z"
                  />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
