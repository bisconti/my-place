/*
  파일명: PlaceDetailView.tsx
  describe
  - 맛집 상세 페이지 본문 component
*/
import { useLocation, useNavigate, useParams } from "react-router-dom";
import BackButton from "../form/BackButton";
import type { Place } from "../../types/place/place.types";

type LocationState = {
  place?: Place;
};

function formatDistance(m?: number) {
  if (m == null) return "정보 없음";
  if (m < 1000) return `${m}m`;
  return `${(m / 1000).toFixed(1)}km`;
}

const PlaceDetailView = () => {
  const navigate = useNavigate();
  const { placeId } = useParams();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const place = state?.place;

  const goReviewWrite = () => {
    navigate(`/places/${placeId}/reviews/write`);
  };

  // state 없이 진입하거나 새로고침한 경우
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
      <div className="max-w-3xl mx-auto">
        <div className="bg-white rounded-xl shadow-md p-8">
          <div className="relative mb-6">
            <BackButton path="/" />
            <h1 className="text-2xl sm:text-3xl font-bold text-center text-red-600">맛집 상세</h1>
          </div>

          <div className="space-y-6">
            {/* 기본 정보 */}
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

            {/* 통계 */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-500">거리</p>
                <p className="text-base text-gray-800 mt-1">{formatDistance(place.distanceM)}</p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-500">평점</p>
                <p className="text-base text-gray-800 mt-1">⭐ {place.rating ?? "-"}</p>
              </div>

              <div className="rounded-lg bg-gray-50 p-4">
                <p className="text-sm text-gray-500">리뷰 수</p>
                <p className="text-base text-gray-800 mt-1">{place.reviewCount ?? "-"}</p>
              </div>
            </div>

            {/* 리뷰 작성 버튼 */}
            <div className="flex justify-end">
              <button
                type="button"
                onClick={goReviewWrite}
                className="px-5 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
              >
                리뷰 작성하기
              </button>
            </div>

            {/* 좌표 */}
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

            {/* 상태 */}
            <div className="rounded-lg border border-gray-100 bg-red-50 p-4">
              <p className="text-sm text-red-700 font-medium">찜 상태</p>
              <p className="text-sm text-red-700 mt-1">
                {place.liked ? "현재 찜한 맛집입니다." : "찜하지 않은 맛집입니다."}
              </p>
            </div>

            {/* 하단 버튼 */}
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
      </div>
    </div>
  );
};

export default PlaceDetailView;
