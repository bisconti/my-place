/*
  file: Header.tsx
  description
  - 인증, 검색, 알림 기능을 포함한 공통 헤더 컴포넌트
*/
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../../stores/authStore";
import { authStorage } from "../../stores/authStorage";
import {
  getUnreadNotificationCount,
  getUserNotifications,
  readAllUserNotifications,
  readUserNotification,
} from "../../api/notification/userNotification.api";
import type { UserNotification } from "../../types/notification/userNotification.type";
import { getPlaceDetail, getPlaceAutoCompleteList } from "../../api/place/place.api";
import type { PlaceAutoCompleteItem } from "../../types/place/place.types";

/** =========================
 * Config
 * ========================= */
const IDLE_TIMEOUT_SEC = 15 * 60;

/** =========================
 * Utils
 * ========================= */
const formatMMSS = (totalSec: number) => {
  const m = Math.floor(totalSec / 60);
  const s = totalSec % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
};

const base64UrlDecode = (input: string) => {
  const pad = "=".repeat((4 - (input.length % 4)) % 4);
  const base64 = (input + pad).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  const bytes = Uint8Array.from(raw, (c) => c.charCodeAt(0));
  return new TextDecoder().decode(bytes);
};

const getJwtLeftSec = (token: string): number | null => {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payloadJson = base64UrlDecode(parts[1]);
    const payload = JSON.parse(payloadJson);
    const exp = payload?.exp;

    if (typeof exp !== "number") return null;
    const nowSec = Math.floor(Date.now() / 1000);
    return Math.max(0, exp - nowSec);
  } catch {
    return null;
  }
};

const getIdleLeftSec = (): number => {
  const nowMs = Date.now();
  const lastMs = authStorage.getLastActivity();

  if (!lastMs) return IDLE_TIMEOUT_SEC;

  const diffSec = Math.floor((nowMs - lastMs) / 1000);
  return Math.max(0, IDLE_TIMEOUT_SEC - diffSec);
};

const formatNotificationDate = (dateString: string) => {
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleString("ko-KR", {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
};

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [leftSec, setLeftSec] = useState<number | null>(null);

  const [unreadCount, setUnreadCount] = useState(0);
  const [notifications, setNotifications] = useState<UserNotification[]>([]);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [isNotificationLoading, setIsNotificationLoading] = useState(false);

  const [searchKeyword, setSearchKeyword] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceAutoCompleteItem[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  const notificationRef = useRef<HTMLDivElement | null>(null);
  const searchRef = useRef<HTMLDivElement | null>(null);

  const expiredHandledRef = useRef(false);
  const lastWriteRef = useRef(0);

  const touchActivity = () => {
    const now = Date.now();
    if (now - lastWriteRef.current < 1000) return;
    lastWriteRef.current = now;
    authStorage.setLastActivity(now);
  };

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

  const fetchNotifications = async () => {
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
  };

  const handleSearch = useCallback(async (keyword: string) => {
    const trimmedKeyword = keyword.trim();

    if (!trimmedKeyword) {
      setSuggestions([]);
      setIsSearchOpen(false);
      return;
    }

    try {
      setIsSearchLoading(true);
      const data = await getPlaceAutoCompleteList(trimmedKeyword);
      setSuggestions(data);
      setIsSearchOpen(true);
    } catch (error) {
      console.error("식당 자동완성 조회 실패", error);
      setSuggestions([]);
      setIsSearchOpen(false);
    } finally {
      setIsSearchLoading(false);
    }
  }, []);

  const handleSelectSuggestion = async (item: PlaceAutoCompleteItem) => {
    try {
      setSearchKeyword(item.placeName);
      setIsSearchOpen(false);

      const place = await getPlaceDetail(item.placeId);

      navigate(`/places/${item.placeId}`, {
        state: { place },
      });
    } catch (error) {
      console.error("식당 상세 이동 실패", error);
      toast.error("식당 정보를 불러오지 못했습니다.");
    }
  };

  const handleSubmitSearch = async () => {
    if (!searchKeyword.trim()) return;

    if (suggestions.length > 0) {
      await handleSelectSuggestion(suggestions[0]);
      return;
    }

    toast("일치하는 식당을 찾지 못했습니다.");
  };

  useEffect(() => {
    expiredHandledRef.current = false;

    if (!user) {
      setLeftSec(null);
      setUnreadCount(0);
      setNotifications([]);
      setIsNotificationOpen(false);
      return;
    }

    touchActivity();
    fetchUnreadCount();
  }, [user, fetchUnreadCount]);

  useEffect(() => {
    if (!user) return;
    touchActivity();
  }, [location.pathname, user]);

  useEffect(() => {
    if (!user) return;

    const onActivity = () => touchActivity();

    window.addEventListener("click", onActivity);
    window.addEventListener("keydown", onActivity);
    window.addEventListener("mousemove", onActivity);
    window.addEventListener("scroll", onActivity, { passive: true });
    window.addEventListener("touchstart", onActivity, { passive: true });

    return () => {
      window.removeEventListener("click", onActivity);
      window.removeEventListener("keydown", onActivity);
      window.removeEventListener("mousemove", onActivity);
      window.removeEventListener("scroll", onActivity);
      window.removeEventListener("touchstart", onActivity);
    };
  }, [user]);

  useEffect(() => {
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
  }, []);

  useEffect(() => {
    if (!searchKeyword.trim()) {
      setSuggestions([]);
      setIsSearchOpen(false);
      return;
    }

    const timer = window.setTimeout(() => {
      handleSearch(searchKeyword);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [searchKeyword, handleSearch]);

  useEffect(() => {
    if (!user) return;

    const tick = () => {
      const idleLeft = getIdleLeftSec();

      const token = authStorage.getAccessToken();
      const jwtLeft = token ? getJwtLeftSec(token) : null;

      const next = jwtLeft === null ? idleLeft : Math.min(idleLeft, jwtLeft);
      setLeftSec(next);
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [user]);

  useEffect(() => {
    if (!user) return;
    if (leftSec === null) return;
    if (leftSec > 0) return;
    if (expiredHandledRef.current) return;

    expiredHandledRef.current = true;
    logout({ silent: true, reason: "expired" });
    toast.error("세션이 만료되어 로그아웃되었어요.");
    navigate("/login");
  }, [leftSec, user, logout, navigate]);

  const timeText = useMemo(() => {
    if (leftSec === null) return "";
    return formatMMSS(leftSec);
  }, [leftSec]);

  const handleNotificationToggle = async () => {
    if (!user) {
      navigate("/login");
      return;
    }

    const nextOpen = !isNotificationOpen;
    setIsNotificationOpen(nextOpen);

    if (nextOpen) {
      await fetchNotifications();
      await fetchUnreadCount();
    }
  };

  const handleNotificationClick = async (notification: UserNotification) => {
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

        navigate(`/places/${notification.targetId}`, {
          state: { place },
        });
        return;
      }

      navigate("/mypage");
    } catch (error) {
      console.error("알림 읽음 처리 실패", error);
      toast.error("알림 처리에 실패했습니다.");
    }
  };

  const handleReadAllNotifications = async () => {
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

      toast.success("모든 알림을 읽음 처리했습니다.");
    } catch (error) {
      console.error("전체 알림 읽음 처리 실패", error);
      toast.error("전체 읽음 처리에 실패했습니다.");
    }
  };

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 items-center h-16">
          <div className="justify-self-start">
            <a href="/" className="text-2xl font-bold text-red-600 hover:text-red-700">
              잇츠맵
            </a>
          </div>

          <div className="hidden md:flex justify-self-center w-full max-w-2xl">
            <div className="relative w-full" ref={searchRef}>
              <input
                type="text"
                value={searchKeyword}
                onChange={(e) => setSearchKeyword(e.target.value)}
                onFocus={() => {
                  if (suggestions.length > 0) {
                    setIsSearchOpen(true);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    handleSubmitSearch();
                  }
                }}
                placeholder="식당, 메뉴, 지역을 검색해보세요"
                className="w-full py-2 pl-4 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
                type="button"
                onClick={handleSubmitSearch}
                className="absolute right-0 top-0 mt-2 mr-3 text-gray-500 hover:text-red-600"
                aria-label="검색 실행"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
                  />
                </svg>
              </button>

              {isSearchOpen && (
                <div className="absolute top-full mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden z-50">
                  {isSearchLoading ? (
                    <div className="px-4 py-3 text-sm text-gray-500">검색 중입니다...</div>
                  ) : suggestions.length === 0 ? (
                    <div className="px-4 py-3 text-sm text-gray-500">검색 결과가 없습니다.</div>
                  ) : (
                    suggestions.map((item) => (
                      <button
                        key={item.placeId}
                        type="button"
                        onClick={() => handleSelectSuggestion(item)}
                        className="w-full px-4 py-3 text-left hover:bg-red-50 border-b last:border-b-0"
                      >
                        <div className="text-sm font-semibold text-gray-900">{item.placeName}</div>
                        <div className="text-xs text-gray-500">
                          {item.category} · {item.roadAddress}
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="justify-self-end flex items-center gap-4">
            {user ? (
              <div className="flex items-center space-x-4 p-2 bg-indigo-50 rounded-full">
                <span className="text-indigo-700 text-sm font-semibold ml-2">{user.username} 님 환영합니다!</span>
                <button
                  onClick={() => {
                    logout({ silent: true, reason: "manual" });
                    toast.success("로그아웃되었습니다.");
                    navigate("/");
                  }}
                  className="px-4 py-1 text-sm font-medium text-white bg-indigo-600 rounded-full shadow-lg hover:bg-indigo-700 transition duration-150 transform hover:scale-105"
                >
                  로그아웃
                </button>
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="px-5 py-2 text-sm font-medium text-white bg-indigo-500 rounded-lg shadow-md hover:bg-indigo-600 transition duration-150 transform hover:scale-105"
              >
                로그인
              </button>
            )}

            <div className="flex items-center gap-2">
              {user && (
                <div className="relative" ref={notificationRef}>
                  <button
                    type="button"
                    onClick={handleNotificationToggle}
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

                    {unreadCount > 0 && (
                      <span className="absolute top-2.5 right-2.5 w-2.5 h-2.5 rounded-full bg-red-500" />
                    )}
                  </button>

                  {isNotificationOpen && (
                    <div className="absolute right-0 mt-2 w-96 max-w-[90vw] bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-50">
                      <div className="flex items-center justify-between px-4 py-3 border-b bg-gray-50">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">알림</p>
                          <p className="text-xs text-gray-500">최근 알림을 확인해보세요.</p>
                        </div>

                        {notifications.length > 0 && unreadCount > 0 && (
                          <button
                            type="button"
                            onClick={handleReadAllNotifications}
                            className="text-xs font-medium text-red-600 hover:text-red-700"
                          >
                            전체 읽음
                          </button>
                        )}
                      </div>

                      <div className="max-h-96 overflow-y-auto">
                        {isNotificationLoading ? (
                          <div className="px-4 py-8 text-sm text-center text-gray-500">알림을 불러오는 중입니다...</div>
                        ) : notifications.length === 0 ? (
                          <div className="px-4 py-8 text-sm text-center text-gray-500">아직 알림이 없습니다.</div>
                        ) : (
                          notifications.slice(0, 5).map((notification) => (
                            <button
                              key={notification.id}
                              type="button"
                              onClick={() => handleNotificationClick(notification)}
                              className={`w-full text-left px-4 py-4 border-b last:border-b-0 hover:bg-gray-50 transition ${
                                notification.isRead ? "bg-white" : "bg-red-50/40"
                              }`}
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <p className="text-sm font-semibold text-gray-900 truncate">{notification.title}</p>
                                    {!notification.isRead && (
                                      <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
                                    )}
                                  </div>

                                  <p className="mt-1 text-sm text-gray-600 line-clamp-2">{notification.content}</p>
                                </div>

                                <span className="text-xs text-gray-400 shrink-0">
                                  {formatNotificationDate(notification.createdAt)}
                                </span>
                              </div>
                            </button>
                          ))
                        )}
                      </div>

                      {notifications.length > 5 && (
                        <div className="px-4 py-3 border-t bg-gray-50">
                          <button
                            type="button"
                            onClick={() => {
                              setIsNotificationOpen(false);
                              navigate("/mypage/notifications");
                            }}
                            className="w-full text-sm font-medium text-gray-700 hover:text-red-600"
                          >
                            전체 알림 보기
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}

              {user && leftSec !== null && (
                <div
                  className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200"
                  title="세션 남은 시간"
                >
                  <span aria-hidden>⏳</span>
                  <span className="tabular-nums">{timeText}</span>
                </div>
              )}

              <button
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
