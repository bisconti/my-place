/*
  파일명: MyReviewList.tsx
  기능
  - 내 리뷰 목록 component
*/
import MyReviewCard from "./MyReviewCard";
import type { PlaceReviewResponse } from "../../types/place/placeReview.types";

type MyReviewListProps = {
  reviews: PlaceReviewResponse[];
  onDelete?: (reviewId: number) => void;
};

const MyReviewList = ({ reviews, onDelete }: MyReviewListProps) => {
  if (reviews.length === 0) {
    return (
      <div className="bg-white rounded-xl shadow-sm border p-8 text-center text-gray-500">작성한 리뷰가 없습니다.</div>
    );
  }

  return (
    <div className="space-y-4">
      {reviews.map((review) => (
        <MyReviewCard key={review.id} review={review} onDelete={onDelete} />
      ))}
    </div>
  );
};

export default MyReviewList;
