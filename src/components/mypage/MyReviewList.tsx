import type { PlaceReviewResponse, PlaceReviewUpdateRequest } from "../../types/place/placeReview.types";
import MyReviewCard from "./MyReviewCard";

type MyReviewListProps = {
  reviews: PlaceReviewResponse[];
  onDelete?: (reviewId: number) => void;
  onUpdate?: (reviewId: number, payload: PlaceReviewUpdateRequest) => void;
  isUpdating?: boolean;
};

const MyReviewList = ({ reviews, onDelete, onUpdate, isUpdating }: MyReviewListProps) => {
  if (reviews.length === 0) {
    return <div className="bg-white rounded-xl shadow-sm border p-8 text-center text-gray-500">작성한 리뷰가 없습니다.</div>;
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <MyReviewCard
          key={review.id}
          review={review}
          onDelete={onDelete}
          onUpdate={onUpdate}
          isUpdating={isUpdating}
        />
      ))}
    </div>
  );
};

export default MyReviewList;
