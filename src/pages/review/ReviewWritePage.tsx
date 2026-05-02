import { useEffect } from "react";
import { useLocation, useNavigate, useParams } from "react-router-dom";
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
