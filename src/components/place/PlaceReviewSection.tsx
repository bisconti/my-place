/*
  file: PlaceReviewSection.tsx
  description
  - 식당 상세 페이지 하단의 리뷰 목록, 빈 상태, 이미지 표시를 담당하는 컴포넌트
*/
import PlaceImageGallery from "./PlaceImageGallery";
import type { PlaceReviewResponse } from "../../types/place/placeReview.types";

type PlaceReviewSectionProps = {
  reviews: PlaceReviewResponse[];
  isLoading: boolean;
  onSelectImage: (src: string, alt: string) => void;
};

function formatDate(dateString?: string) {
  if (!dateString) return "";

  const date = new Date(dateString);
  if (Number.isNaN(date.getTime())) return "";

  return date.toLocaleDateString("ko-KR");
}

function renderStars(rating: number) {
  const safeRating = Math.max(0, Math.min(5, Math.round(rating)));
  return "★".repeat(safeRating) + "☆".repeat(5 - safeRating);
}

const PlaceReviewSection = ({ reviews, isLoading, onSelectImage }: PlaceReviewSectionProps) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-8">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gray-900">리뷰</h2>
        <p className="text-sm text-gray-500 mt-1">다른 사용자가 작성한 리뷰와 사진을 확인해보세요.</p>
      </div>

      {isLoading ? (
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
                <div className="mt-4">
                  <PlaceImageGallery
                    images={review.images}
                    emptyMessage=""
                    altPrefix="리뷰"
                    imageHeightClassName="h-32"
                    onSelectImage={onSelectImage}
                  />
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PlaceReviewSection;
