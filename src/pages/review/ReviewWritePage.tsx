/*
  파일명: ReviewWritePage.tsx
  describe
  - 리뷰 작성 페이지
*/

import { useParams } from "react-router-dom";
import ReviewWriteView from "../../components/review/ReviewWirteView";

const ReviewWritePage = () => {
  const { placeId } = useParams();

  return <ReviewWriteView placeId={placeId} />;
};

export default ReviewWritePage;
