/*
  file: MyReviewList.tsx
  description
  - 내가 작성한 리뷰 목록을 렌더링하는 컴포넌트
*/
import type { PlaceReviewResponse } from "../../types/place/placeReview.types";
import MyReviewCard from "./MyReviewCard";

type MyReviewListProps = {
  reviews: PlaceReviewResponse[];
  onDelete?: (reviewId: number) => void;
};

const MyReviewList = ({ reviews, onDelete }: MyReviewListProps) => {
  if (reviews.length === 0) {
    return <div className="bg-white rounded-xl shadow-sm border p-8 text-center text-gray-500">작성한 리뷰가 없습니다.</div>;
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
