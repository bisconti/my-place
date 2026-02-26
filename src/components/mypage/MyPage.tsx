import { useMemo } from "react";
import { useNavigate } from "react-router-dom";
import BackButton from "../form/BackButton";
import { useAuth } from "../../hooks/useAuth";

const MyPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // 더미 데이터
  const stats = useMemo(
    () => [
      { label: "내 리뷰", value: 0, desc: "작성한 리뷰 수" },
      { label: "찜한 맛집", value: 0, desc: "저장한 맛집 수" },
      { label: "최근 방문", value: 0, desc: "최근 방문 기록" },
    ],
    []
  );

  const recentActivities = useMemo(
    () => [
      { title: "아직 활동이 없어요", meta: "리뷰를 작성해보세요." },
      { title: "찜 기능을 사용해보세요", meta: "마음에 드는 맛집을 저장!" },
      { title: "방문 기록을 남겨보세요", meta: "나만의 맛집 지도 완성" },
    ],
    []
  );

  if (!user) {
    navigate("/login");
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative mb-6">
          <BackButton path="/" />
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-red-600">마이페이지</h1>
          <p className="text-center text-gray-500 mt-2">내 정보와 활동을 한눈에 확인하세요.</p>
        </div>

        {/* 프로필 카드 */}
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
                onClick={() => navigate("/mypage/profile")}
                className="px-4 py-2 text-sm font-medium rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
              >
                프로필 수정
              </button>

              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="px-4 py-2 text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition"
              >
                로그아웃
              </button>
            </div>
          </div>
        </div>

        {/* 요약 통계 */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          {stats.map((s) => (
            <div key={s.label} className="bg-white rounded-xl shadow-md p-6">
              <p className="text-sm text-gray-500">{s.label}</p>
              <p className="text-3xl font-bold text-gray-900 mt-2">{s.value}</p>
              <p className="text-xs text-gray-400 mt-2">{s.desc}</p>
            </div>
          ))}
        </div>

        {/* 본문: 메뉴 + 최근 활동 */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* 왼쪽 메뉴 */}
          <div className="bg-white rounded-xl shadow-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">메뉴</h3>

            <div className="space-y-2">
              <MenuButton label="내 정보" desc="프로필/닉네임 수정" onClick={() => navigate("/mypage/profile")} />
              <MenuButton
                label="비밀번호 변경"
                desc="보안을 위해 주기적으로 변경"
                onClick={() => navigate("/mypage/change-password")}
              />
              <MenuButton label="찜한 맛집" desc="내가 저장한 리스트" onClick={() => navigate("/mypage/favorites")} />
              <MenuButton label="내 리뷰" desc="작성한 리뷰 관리" onClick={() => navigate("/mypage/reviews")} />
              <MenuButton label="설정" desc="알림/계정 설정" onClick={() => navigate("/mypage/settings")} />
            </div>

            <div className="border-t mt-4 pt-4">
              <button
                onClick={() => {
                  logout();
                  navigate("/");
                }}
                className="w-full py-2 text-sm font-medium rounded-lg text-red-600 border border-red-200 hover:bg-red-50 transition"
              >
                로그아웃
              </button>
            </div>
          </div>

          {/* 오른쪽 최근 활동 */}
          <div className="bg-white rounded-xl shadow-md p-6 lg:col-span-2">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900">최근 활동</h3>
              <button
                onClick={() => navigate("/mypage/reviews")}
                className="text-sm font-medium text-red-600 hover:text-red-700"
              >
                전체보기
              </button>
            </div>

            <div className="space-y-3">
              {recentActivities.map((a, idx) => (
                <div
                  key={`${a.title}-${idx}`}
                  className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition"
                >
                  <p className="font-semibold text-gray-900">{a.title}</p>
                  <p className="text-sm text-gray-500 mt-1">{a.meta}</p>
                </div>
              ))}
            </div>

            <div className="mt-6 p-4 rounded-lg bg-red-50 border border-red-100">
              <p className="text-sm text-red-700 font-medium">TIP</p>
              <p className="text-sm text-red-700 mt-1">맛집을 “찜”하고 리뷰를 남기면 내 활동이 이곳에 표시돼요.</p>
            </div>
          </div>
        </div>

        {/* 하단 여백 */}
        <div className="h-10" />
      </div>
    </div>
  );
};

export default MyPage;

const MenuButton = ({ label, desc, onClick }: { label: string; desc: string; onClick: () => void }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-red-200 hover:bg-red-50 transition"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">{label}</p>
          <p className="text-xs text-gray-500 mt-1">{desc}</p>
        </div>
        <span className="text-gray-400">›</span>
      </div>
    </button>
  );
};
