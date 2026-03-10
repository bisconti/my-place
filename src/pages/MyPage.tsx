/*
  파일명: MyPage.tsx
  describe
  - 마이페이지
*/
import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { getMyPlaceLikeCount } from "../api/placeLike.api";
import BackButton from "../components/form/BackButton";
import MyPageProfileCard from "../components/mypage/MyPageProfileCard";
import MyPageStats from "../components/mypage/MyPageStats";
import MyPageMenu from "../components/mypage/MyPageMenu";
import MyPageRecentActivities from "../components/mypage/MyPageRecentActivities";

const MyPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [likeCount, setLikeCount] = useState(0);

  // 찜 목록 건수 조회
  useEffect(() => {
    const fetchLikeCount = async () => {
      try {
        const res = await getMyPlaceLikeCount();
        setLikeCount(res.data);
      } catch (err) {
        console.error("찜 개수 조회 실패", err);
      }
    };

    fetchLikeCount();
  }, []);

  const stats = useMemo(
    () => [
      { label: "내 리뷰", value: 0, desc: "작성한 리뷰 수" },
      { label: "찜한 맛집", value: likeCount, desc: "저장한 맛집 수" },
      { label: "최근 방문", value: 0, desc: "최근 방문 기록" },
    ],
    [likeCount]
  );

  const recentActivities = useMemo(
    () => [
      { title: "아직 활동이 없어요", meta: "리뷰를 작성해보세요." },
      { title: "찜 기능을 사용해보세요", meta: "마음에 드는 맛집을 저장!" },
      { title: "방문 기록을 남겨보세요", meta: "나만의 맛집 지도 완성" },
    ],
    []
  );

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative mb-6">
          <BackButton path="/" />
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-red-600">마이페이지</h1>
          <p className="text-center text-gray-500 mt-2">내 정보와 활동을 한눈에 확인하세요.</p>
        </div>

        <MyPageProfileCard user={user} onEditProfile={() => navigate("/mypage/profile")} onLogout={handleLogout} />

        <MyPageStats stats={stats} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <MyPageMenu
            onProfile={() => navigate("/mypage/profile")}
            onChangePassword={() => navigate("/mypage/change-password")}
            onFavorites={() => navigate("/mypage/favorites")}
            onReviews={() => navigate("/mypage/reviews")}
            onSettings={() => navigate("/mypage/settings")}
            onLogout={handleLogout}
          />

          <MyPageRecentActivities activities={recentActivities} onViewAll={() => navigate("/mypage/reviews")} />
        </div>

        <div className="h-10" />
      </div>
    </div>
  );
};

export default MyPage;
