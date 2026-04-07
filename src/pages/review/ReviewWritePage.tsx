/*
  파일명: ReviewWritePage.tsx
  describe
  - 리뷰 작성 페이지
  - useLocation으로 이전 페이지에서 전달받은 place 정보를 ReviewWriteView에 전달
*/

import { useLocation, useNavigate, useParams } from "react-router-dom";
import { useEffect } from "react";
import ReviewWriteView from "../../components/review/ReviewWirteView";

type PlaceState = {
  id: string;
  name: string;
  address?: string;
  roadAddress?: string;
  category?: string;
  phone?: string;
};

const ReviewWritePage = () => {
  const { placeId } = useParams();
  const location = useLocation();
  const navigate = useNavigate();

  const place = location.state?.place as PlaceState | undefined;

  // place 정보가 없으면 이전 페이지로 복귀
  useEffect(() => {
    if (!place || !placeId) {
      alert("장소 정보를 찾을 수 없습니다.");
      navigate(-1);
    }
  }, [place, placeId, navigate]);

  if (!place || !placeId) return null;

  return <ReviewWriteView place={{ ...place, id: placeId }} />;
};

export default ReviewWritePage;
