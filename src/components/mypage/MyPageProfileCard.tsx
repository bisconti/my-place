/*
  파일명: MyPageProfileCard.tsx
  describe
  - 마이페이지 상단 profile card component
*/
import type { User } from "../../types/user/user.types";

type MyPageProfileCardProps = {
  user: User;
  onEditProfile: () => void;
  onLogout: () => void;
};

const MyPageProfileCard = ({ user, onEditProfile, onLogout }: MyPageProfileCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-2xl p-6 sm:p-8 mb-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
        <div className="flex items-center gap-4">
          {/* 아바타 */}
          <div className="w-14 h-14 rounded-full bg-red-100 flex items-center justify-center">
            <span className="text-red-600 font-bold text-lg">{user.username?.slice(0, 1) ?? "U"}</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold text-gray-900">{user.username} 님</h2>
              <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-600">일반 회원</span>
            </div>
            <p className="text-sm text-gray-500 mt-1">{user.useremail ?? "이메일 정보 없음"}</p>
            <p className="text-sm text-gray-600 mt-2">오늘도 맛집 탐방 ✨ 기록을 남겨보세요.</p>
          </div>
        </div>

        <div className="flex gap-3">
          <button
            onClick={onEditProfile}
            className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
          >
            프로필 수정
          </button>

          <button
            onClick={onLogout}
            className="px-4 py-2 text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition"
          >
            로그아웃
          </button>
        </div>
      </div>
    </div>
  );
};

export default MyPageProfileCard;
