import { useState } from "react";
import type { PlaceReviewResponse, PlaceReviewUpdateRequest } from "../../types/place/placeReview.types";

type MyReviewCardProps = {
  review: PlaceReviewResponse;
  onDelete?: (reviewId: number) => void;
  onUpdate?: (reviewId: number, payload: PlaceReviewUpdateRequest) => void;
  isUpdating?: boolean;
};

const renderStars = (rating: number) => {
  return "★".repeat(Math.max(0, Math.min(5, rating)));
};

const formatDate = (dateString: string) => {
  if (!dateString) return "-";
  return new Date(dateString).toLocaleDateString("ko-KR");
};

const MyReviewCard = ({ review, onDelete, onUpdate, isUpdating = false }: MyReviewCardProps) => {
  const [isEditing, setIsEditing] = useState(false);
  const [rating, setRating] = useState(review.rating);
  const [content, setContent] = useState(review.content);

  const handleCancel = () => {
    setRating(review.rating);
    setContent(review.content);
    setIsEditing(false);
  };

  const handleSave = () => {
    if (!content.trim()) {
      alert("리뷰 내용을 입력해주세요.");
      return;
    }

    onUpdate?.(review.id, { rating, content });
    setIsEditing(false);
  };

  return (
    <div className="bg-white rounded-xl shadow-sm border p-5">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-gray-900">{review.placeName}</h3>
          <p className="text-sm text-gray-500 mt-1">작성일 {formatDate(review.createdAt)}</p>
        </div>

        <div className="text-sm font-semibold text-yellow-500">{renderStars(review.rating)}</div>
      </div>

      {isEditing ? (
        <div className="mt-4 space-y-3">
          <div className="flex gap-1 text-2xl">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className={star <= rating ? "text-yellow-400" : "text-gray-300 hover:text-yellow-300"}
                aria-label={`${star}점`}
              >
                ★
              </button>
            ))}
          </div>

          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            className="h-28 w-full resize-none rounded-lg border p-3 text-sm focus:outline-none focus:ring-2 focus:ring-red-400"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm hover:bg-gray-50"
            >
              취소
            </button>
            <button
              type="button"
              onClick={handleSave}
              disabled={isUpdating}
              className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:bg-gray-300"
            >
              저장
            </button>
          </div>
        </div>
      ) : (
        <p className="mt-4 text-sm text-gray-700 leading-relaxed whitespace-pre-line">{review.content}</p>
      )}

      {review.images && review.images.length > 0 && (
        <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
          {review.images.map((image) => (
            <img
              key={image.id}
              src={`${import.meta.env.VITE_IMAGE_BASE_URL}${image.filePath}`}
              alt={image.originalFileName}
              className="w-full h-28 object-cover rounded-lg border"
            />
          ))}
        </div>
      )}

      {!isEditing && (onDelete || onUpdate) && (
        <div className="mt-4 flex justify-end gap-2">
          {onUpdate && (
            <button
              type="button"
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 text-sm font-medium rounded-lg text-gray-700 border border-gray-200 hover:bg-gray-50 transition"
            >
              수정
            </button>
          )}

          {onDelete && (
            <button
              type="button"
              onClick={() => onDelete(review.id)}
              className="px-4 py-2 text-sm font-medium rounded-lg text-red-600 border border-red-200 hover:bg-red-50 transition"
            >
              삭제
            </button>
          )}
        </div>
      )}
    </div>
  );
};

export default MyReviewCard;
