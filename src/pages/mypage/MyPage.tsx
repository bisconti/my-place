/*
  파일명 MyPage.tsx
  기능
  - 마이페이지의 프로필, 통계, 메뉴, 최근 방문 영역을 구성
*/
import { useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { getMyPlaceLikeCount } from "../../api/place/placeLike.api";
import { getRecentPlacesApi } from "../../api/place/recentPlace.api";
import { getMyReviewCount } from "../../api/place/placeReview.api";
import BackButton from "../../components/form/BackButton";
import MyPageMenu from "../../components/mypage/MyPageMenu";
import MyPageProfileCard from "../../components/mypage/MyPageProfileCard";
import MyPageRecentActivities from "../../components/mypage/MyPageRecentActivities";
import MyPageStats from "../../components/mypage/MyPageStats";
import RecentPlace from "../../components/mypage/RecentPlace";
import { useAuth } from "../../hooks/useAuth";

const MyPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const [likeCount, setLikeCount] = useState(0);
  const [reviewCount, setReviewCount] = useState(0);
  const [recentPlaceCount, setRecentPlaceCount] = useState(0);
  const [isRecentPlaceVisible, setIsRecentPlaceVisible] = useState(false);

  useEffect(() => {
    if (!user?.useremail) return;

    const fetchMyPageCounts = async () => {
      try {
        const [likeResult, reviewResult, recentResult] = await Promise.allSettled([
          getMyPlaceLikeCount(),
          getMyReviewCount(user.useremail),
          getRecentPlacesApi(),
        ]);

        if (likeResult.status === "fulfilled") {
          setLikeCount(likeResult.value.data);
        }

        if (reviewResult.status === "fulfilled") {
          setReviewCount(reviewResult.value.data);
        }

        if (recentResult.status === "fulfilled") {
          setRecentPlaceCount(recentResult.value.length);
        }
      } catch (error) {
        console.error("마이페이지 통계 조회 실패", error);
      }
    };

    void fetchMyPageCounts();
  }, [user?.useremail]);

  const stats = useMemo(
    () => [
      { label: "내 리뷰", value: reviewCount, desc: "작성한 리뷰 수" },
      { label: "찜한 맛집", value: likeCount, desc: "좋아요한 식당 수" },
      {
        label: "최근 방문",
        value: recentPlaceCount,
        desc: "최근 방문 기록",
        onClick: () => setIsRecentPlaceVisible((prev) => !prev),
      },
    ],
    [likeCount, recentPlaceCount, reviewCount]
  );

  const recentActivities = useMemo(
    () => [
      { title: "리뷰를 남겨보세요", meta: "방문한 식당 경험을 기록할 수 있어요." },
      { title: "저장 리스트를 만들어보세요", meta: "치킨, 데이트, 혼밥처럼 목적별로 모아둘 수 있어요." },
      { title: "최근 방문 기록을 확인해보세요", meta: "다시 가고 싶은 식당을 빠르게 찾을 수 있어요." },
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
          <p className="text-center text-gray-500 mt-2">내 정보와 활동 내역을 한눈에 확인해보세요.</p>
        </div>

        <MyPageProfileCard user={user} onEditProfile={() => navigate("/mypage/profile")} onLogout={handleLogout} />

        <MyPageStats stats={stats} />

        {isRecentPlaceVisible && <RecentPlace />}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <MyPageMenu
            onProfile={() => navigate("/mypage/profile")}
            onChangePassword={() => navigate("/mypage/change-password")}
            onCollections={() => navigate("/mypage/place-collections")}
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
