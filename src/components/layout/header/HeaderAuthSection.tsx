/*
  file: HeaderAuthSection.tsx
  description
  - 로그인 상태에 따른 사용자 인사, 로그인 버튼, 세션 타이머 UI를 렌더링하는 컴포넌트
*/
import type { User } from "../../../types/user/user.types";

type HeaderAuthSectionProps = {
  user: User | null;
  timeText: string;
  onLogin: () => void;
  onLogout: () => void;
};

const HeaderAuthSection = ({ user, timeText, onLogin, onLogout }: HeaderAuthSectionProps) => {
  return (
    <>
      {user ? (
        <div className="flex items-center space-x-4 p-2 bg-indigo-50 rounded-full">
          <span className="text-indigo-700 text-sm font-semibold ml-2">{user.username} 님 환영합니다!</span>
          <button
            type="button"
            onClick={onLogout}
            className="px-4 py-1 text-sm font-medium text-white bg-indigo-600 rounded-full shadow-lg hover:bg-indigo-700 transition duration-150 transform hover:scale-105"
          >
            로그아웃
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onLogin}
          className="px-5 py-2 text-sm font-medium text-white bg-indigo-500 rounded-lg shadow-md hover:bg-indigo-600 transition duration-150 transform hover:scale-105"
        >
          로그인
        </button>
      )}

      {user && timeText && (
        <div
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-xs font-semibold border border-slate-200"
          title="세션 남은 시간"
        >
          <span aria-hidden>⏳</span>
          <span className="tabular-nums">{timeText}</span>
        </div>
      )}
    </>
  );
};

export default HeaderAuthSection;
