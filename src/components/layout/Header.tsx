import { useEffect, useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { useAuthStore } from "../../stores/authStore";

/** =========================
 * Config
 * ========================= */
const TOKEN_KEY = "token";
const LAST_ACTIVITY_KEY = "lastActivityAt";
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

    if (typeof exp !== "number") return null; // exp = unix seconds
    const nowSec = Math.floor(Date.now() / 1000);
    return Math.max(0, exp - nowSec);
  } catch {
    return null;
  }
};

const getIdleLeftSec = (): number => {
  const nowMs = Date.now();
  const lastMs = Number(localStorage.getItem(LAST_ACTIVITY_KEY) || "0");

  // 최초 진입/기록이 없으면 풀로 시작
  if (!lastMs) return IDLE_TIMEOUT_SEC;

  const diffSec = Math.floor((nowMs - lastMs) / 1000);
  return Math.max(0, IDLE_TIMEOUT_SEC - diffSec);
};

const Header = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  const [leftSec, setLeftSec] = useState<number | null>(null);

  // 만료 처리 중복 방지
  const expiredHandledRef = useRef(false);

  // 활동 기록 저장 과도 방지
  const lastWriteRef = useRef(0);

  const touchActivity = () => {
    const now = Date.now();
    if (now - lastWriteRef.current < 1000) return; // throttle
    lastWriteRef.current = now;
    localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
  };

  /** =========================
   * 로그인/로그아웃 변화 처리
   * ========================= */
  useEffect(() => {
    expiredHandledRef.current = false;

    if (!user) {
      setLeftSec(null);
      return;
    }

    // 로그인 직후 활동 시작
    touchActivity();
  }, [user]);

  // 활동 처리
  useEffect(() => {
    if (!user) return;
    touchActivity();
  }, [location.pathname, user]);

  /** =========================
   * 사용자 활동 이벤트 바인딩
   * ========================= */
  useEffect(() => {
    if (!user) return;

    const onActivity = () => touchActivity();

    // scroll/touch 이벤트는 passive로
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

  /** =========================
   * 1초마다 남은시간 계산
   * - idleRemaining 과 jwtRemaining 중 "더 짧은 값"을 표시/판정
   * ========================= */
  useEffect(() => {
    if (!user) return;

    const tick = () => {
      const idleLeft = getIdleLeftSec();

      const token = localStorage.getItem(TOKEN_KEY);
      const jwtLeft = token ? getJwtLeftSec(token) : null;

      // jwtLeft가 없으면 idle만 사용
      const next = jwtLeft === null ? idleLeft : Math.min(idleLeft, jwtLeft);
      setLeftSec(next);
    };

    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, [user]);

  /** =========================
   * 만료 처리
   * ========================= */
  useEffect(() => {
    if (!user) return;
    if (leftSec === null) return;
    if (leftSec > 0) return;
    if (expiredHandledRef.current) return;

    expiredHandledRef.current = true;
    logout();
    toast.error("세션이 만료되어 로그아웃되었습니다.");
    navigate("/login");
  }, [leftSec, user, logout, navigate]);

  const timeText = useMemo(() => {
    if (leftSec === null) return "";
    return formatMMSS(leftSec);
  }, [leftSec]);

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 items-center h-16">
          {/* 왼쪽 */}
          <div className="justify-self-start">
            <a href="/" className="text-2xl font-bold text-red-600 hover:text-red-700">
              잇츠맵
            </a>
          </div>

          {/* 가운데 */}
          <div className="hidden md:flex justify-self-center w-full max-w-2xl">
            <div className="relative w-full">
              <input
                type="text"
                placeholder="식당, 메뉴, 지역을 검색해보세요"
                className="w-full py-2 pl-4 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
              />
              <button
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
            </div>
          </div>

          {/* 오른쪽 */}
          <div className="justify-self-end flex items-center gap-4">
            {user ? (
              <div className="flex items-center space-x-4 p-2 bg-indigo-50 rounded-full">
                <span className="text-indigo-700 text-sm font-semibold ml-2">{user.username} 님 환영합니다!</span>
                <button
                  onClick={() => {
                    logout();
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

            {/* 세션(유휴/토큰) 남은시간 배지 + 사람 아이콘(디자인 유지) */}
            <div className="flex items-center gap-2">
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
