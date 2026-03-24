/*
  파일명: MyReviewsPage.tsx
  기능
  - 내가 작성한 리뷰 조회 page
*/
import { useCallback, useEffect, useState } from "react";
import type { PlaceReviewResponse } from "../../types/place/placeReview.types";
import { deletePlaceReview, getMyReviews } from "../../api/placeReview.api";
import MyReviewList from "../../components/mypage/MyReviewList";
import { useAuthStore } from "../../stores/authStore";

const MyReviewsPage = () => {
  const [reviews, setReviews] = useState<PlaceReviewResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // zustand 활용
  const user = useAuthStore((state) => state.user);
  const useremail = user?.useremail || "";

  const fetchMyReviews = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      console.log(useremail);

      if (!useremail) {
        setError("로그인 정보가 없습니다.");
        return;
      }

      const data = await getMyReviews(useremail);
      setReviews(data);
    } catch (err) {
      console.error("내 리뷰 조회 실패:", err);
      setError("내 리뷰를 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [useremail]);

  const handleDeleteReview = async (reviewId: number) => {
    const isConfirmed = window.confirm("정말 이 리뷰를 삭제하시겠습니까?");
    if (!isConfirmed) return;

    try {
      await deletePlaceReview(reviewId);
      setReviews((prev) => prev.filter((review) => review.id !== reviewId));
      alert("리뷰가 삭제되었습니다.");
    } catch (err) {
      console.error("리뷰 삭제 실패:", err);
      alert("리뷰 삭제에 실패했습니다.");
    }
  };

  useEffect(() => {
    fetchMyReviews();
  }, [fetchMyReviews]);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">내 리뷰</h1>
        <p className="text-sm text-gray-500 mt-1">내가 작성한 리뷰를 확인하고 관리할 수 있습니다.</p>
      </div>

      {loading && (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center text-gray-500">
          리뷰를 불러오는 중입니다...
        </div>
      )}

      {!loading && error && (
        <div className="bg-white rounded-xl shadow-sm border p-8 text-center text-red-500">{error}</div>
      )}

      {!loading && !error && <MyReviewList reviews={reviews} onDelete={handleDeleteReview} />}
    </div>
  );
};

export default MyReviewsPage;
