/*
  파일명: MyReviewCard.tsx
  기능
  - 내 리뷰 목록 카드 component
*/

import type { PlaceReviewResponse } from "../../types/place/placeReview.types";

type MyReviewCardProps = {
  review: PlaceReviewResponse;
  onDelete?: (reviewId: number) => void;
};

const renderStars = (rating: number) => {
  return "⭐".repeat(rating);
};

const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("ko-KR");
};

const MyReviewCard = ({ review, onDelete }: MyReviewCardProps) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-gray-900">식당 ID: {review.placeId}</h3>
          <p className="text-sm text-gray-500 mt-1">작성일: {formatDate(review.createdAt)}</p>
        </div>

        <div className="text-sm font-semibold text-yellow-500">{renderStars(review.rating)}</div>
      </div>

      <p className="mt-4 text-sm text-gray-700 leading-relaxed whitespace-pre-line">{review.content}</p>

      {review.images && review.images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {review.images.map((image) => (
            <img
              key={image.id}
              src={image.filePath}
              alt={image.originalFileName}
              className="w-full h-28 object-cover rounded-lg border"
            />
          ))}
        </div>
      )}

      {onDelete && (
        <div className="mt-4 flex justify-end">
          <button
            onClick={() => onDelete(review.id)}
            className="px-4 py-2 text-sm font-medium rounded-lg text-red-600 border border-red-200 hover:bg-red-50 transition"
          >
            리뷰 삭제
          </button>
        </div>
      )}
    </div>
  );
};

export default MyReviewCard;
