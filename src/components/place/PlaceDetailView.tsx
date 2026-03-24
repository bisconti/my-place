import { useEffect, useState } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
import BackButton from "../form/BackButton";
import type { Place } from "../../types/place/place.types";
import type { PlaceReviewResponse, PlaceReviewSummaryResponse } from "../../types/place/placeReview.types";
import { getPlaceReviews, getPlaceReviewSummary } from "../../api/placeReview.api";

type LocationState = {
  place?: Place;
};

function formatDistance(m?: number) {
  if (m == null) return "정보 없음";
  if (m < 1000) return `${m}m`;
  return `${(m / 1000).toFixed(1)}km`;
}

function formatDate(dateString?: string) {
  if (!dateString) return "";
  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("ko-KR");
}

function renderStars(rating: number) {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}

const PlaceDetailView = () => {
  const navigate = useNavigate();
  const { placeId } = useParams();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const place = state?.place;

  const [reviewSummary, setReviewSummary] = useState<PlaceReviewSummaryResponse | null>(null);
  const [reviews, setReviews] = useState<PlaceReviewResponse[]>([]);
  const [isReviewLoading, setIsReviewLoading] = useState(false);

  const imageBaseURL = "http://localhost:3001";

  useEffect(() => {
    if (!placeId) return;

    const fetchReviewData = async () => {
      try {
        setIsReviewLoading(true);

        const [summaryRes, reviewsRes] = await Promise.all([getPlaceReviewSummary(placeId), getPlaceReviews(placeId)]);

        setReviewSummary(summaryRes.data);
        setReviews(reviewsRes.data);
      } catch (error) {
        console.error("리뷰 데이터 조회 실패:", error);
      } finally {
        setIsReviewLoading(false);
      }
    };

    fetchReviewData();
  }, [placeId]);

  const goReviewWrite = () => {
    navigate(`/places/${placeId}/reviews/write`);
  };

  if (!place) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8 text-center">
          <div className="relative mb-6">
            <BackButton path="/" />
            <h1 className="text-2xl sm:text-3xl font-bold text-center text-red-600">맛집 상세</h1>
          </div>

          <p className="text-gray-600">상세 정보가 없습니다.</p>
          <p className="text-sm text-gray-400 mt-2">placeId: {placeId}</p>

          <button
            type="button"
            onClick={() => navigate("/")}
            className="mt-6 px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700 transition"
          >
            메인으로 돌아가기
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="relative mb-6">
            <BackButton path="/" />
            <h1 className="text-2xl sm:text-3xl font-bold text-center text-red-600">맛집 상세</h1>
          </div>

          <div className="space-y-6">
            <div>
              <p className="text-sm text-gray-500">가게명</p>
              <h2 className="text-2xl font-bold text-gray-900 mt-1">{place.name}</h2>
            </div>

            <div>
              <p className="text-sm text-gray-500">카테고리</p>
              <p className="text-base text-gray-800 mt-1">{place.category || "정보 없음"}</p>
            </div>

            <div>
              <p className="text-sm text-gray-500">주소</p>
              <p className="text-base text-gray-800 mt-1">{place.address || "정보 없음"}</p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-500">거리</p>
                <p className="text-base text-gray-800 mt-1">{formatDistance(place.distanceM)}</p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-500">평점</p>
                <p className="text-base text-gray-800 mt-1">⭐ {reviewSummary ? reviewSummary.averageRating : "-"}</p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-500">리뷰 수</p>
                <p className="text-base text-gray-800 mt-1">{reviewSummary ? reviewSummary.reviewCount : 0}</p>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                onClick={goReviewWrite}
                className="px-5 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
              >
                리뷰 작성하기
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-500">위도</p>
                <p className="text-base text-gray-800 mt-1">{place.lat}</p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-500">경도</p>
                <p className="text-base text-gray-800 mt-1">{place.lng}</p>
              </div>
            </div>

            <div className="rounded-lg border border-gray-100 bg-red-50 p-4">
              <p className="text-sm text-red-700 font-medium">찜 상태</p>
              <p className="text-sm text-red-700 mt-1">
                {place.liked ? "현재 찜한 맛집입니다." : "찜하지 않은 맛집입니다."}
              </p>
            </div>

            <div className="pt-4 border-t">
              <button
                type="button"
                onClick={() => navigate(-1)}
                className="w-full py-3 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 transition"
              >
                이전 화면으로 돌아가기
              </button>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-gray-900">리뷰</h2>
            <p className="text-sm text-gray-500 mt-1">다른 사용자가 작성한 리뷰와 사진을 확인해보세요.</p>
          </div>

          {isReviewLoading ? (
            <p className="text-gray-500">리뷰를 불러오는 중입니다...</p>
          ) : reviews.length === 0 ? (
            <div className="rounded-lg bg-gray-50 p-6 text-center text-gray-500">아직 등록된 리뷰가 없습니다.</div>
          ) : (
            <div className="space-y-6">
              {reviews.map((review) => (
                <div key={review.id} className="border rounded-xl p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-gray-900">{review.nickname}</p>
                      <p className="text-sm text-yellow-500 mt-1">{renderStars(review.rating)}</p>
                    </div>
                    <p className="text-sm text-gray-400">{formatDate(review.createdAt)}</p>
                  </div>

                  <p className="text-gray-800 mt-4 whitespace-pre-wrap">{review.content}</p>

                  {review.images && review.images.length > 0 && (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mt-4">
                      {review.images
                        .sort((a, b) => a.sortOrder - b.sortOrder)
                        .map((image) => (
                          <div key={image.id} className="overflow-hidden rounded-lg border bg-gray-50">
                            <img
                              src={`${imageBaseURL}${image.filePath}`}
                              alt={image.originalFileName}
                              className="w-full h-32 object-cover"
                            />
                          </div>
                        ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlaceDetailView;
