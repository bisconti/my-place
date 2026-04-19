/*
  file: PlaceDetailView.tsx
  description
  - 식당 상세 화면을 조합하고 상세 조회 훅과 서브 컴포넌트를 연결하는 컨테이너 컴포넌트
*/
import { useLocation, useNavigate, useParams } from "react-router-dom";
import BackButton from "../form/BackButton";
import ImageViewerModal from "../share/ImageViewerModal";
import { usePlaceDetailData } from "../../hooks/usePlaceDetailData";
import type { Place } from "../../types/place/place.types";
import PlaceCollectionSaveModal from "./PlaceCollectionSaveModal";
import PlaceImageGallery from "./PlaceImageGallery";
import PlaceReviewSection from "./PlaceReviewSection";

type LocationState = {
  place?: Place;
};

function formatDistance(distance?: number) {
  if (distance == null) return "정보 없음";
  if (distance < 1000) return `${distance}m`;
  return `${(distance / 1000).toFixed(1)}km`;
}

const PlaceDetailView = () => {
  const navigate = useNavigate();
  const { placeId } = useParams();
  const location = useLocation();
  const state = location.state as LocationState | null;

  const {
    token,
    place,
    isPlaceLoading,
    reviewSummary,
    reviews,
    isReviewLoading,
    viewerImage,
    collections,
    isCollectionLoading,
    isSaveModalOpen,
    setIsSaveModalOpen,
    openSaveModal,
    fetchCollections,
    openImageViewer,
    closeImageViewer,
  } = usePlaceDetailData(placeId, state?.place ?? null);

  const moveToLoginIfNeeded = () => {
    if (token) return false;

    alert("로그인 후 이용가능합니다.");
    navigate("/login");
    return true;
  };

  const handleReviewWrite = () => {
    if (!place || !placeId) return;
    if (moveToLoginIfNeeded()) return;

    navigate(`/places/${placeId}/reviews/write`, {
      state: {
        place: {
          id: placeId,
          name: place.name,
          address: place.address,
          roadAddress: place.roadAddress,
          category: place.category,
          phone: place.phone,
          lat: place.lat,
          lng: place.lng,
          liked: place.liked,
          distanceM: place.distanceM,
          images: place.images,
        },
      },
    });
  };

  const handleOpenSaveModal = async () => {
    if (!place) return;
    if (moveToLoginIfNeeded()) return;

    await openSaveModal();
  };

  if (isPlaceLoading) {
    return (
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-3xl mx-auto bg-white rounded-xl shadow-md p-8 text-center">
          <div className="relative mb-6">
            <BackButton path="/" />
            <h1 className="text-2xl sm:text-3xl font-bold text-center text-red-600">맛집 상세</h1>
          </div>
          <p className="text-gray-500">상세 정보를 불러오는 중입니다...</p>
        </div>
      </div>
    );
  }

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
    <>
      <div className="min-h-screen bg-gray-50 p-4">
        <div className="max-w-3xl mx-auto space-y-6">
          <div className="bg-white rounded-xl shadow-md p-8">
            <div className="relative mb-6">
              <BackButton path="/" />
              <h1 className="text-2xl sm:text-3xl font-bold text-center text-red-600">맛집 상세</h1>
            </div>

            <div className="space-y-6">
              <div>
                <p className="text-sm text-gray-500 mb-3">가게 이미지</p>
                <PlaceImageGallery
                  images={place.images ?? []}
                  emptyMessage="등록된 가게 이미지가 없습니다."
                  altPrefix={place.name}
                  onSelectImage={openImageViewer}
                />
              </div>

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
                <p className="text-base text-gray-800 mt-1">{place.roadAddress || place.address || "정보 없음"}</p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">거리</p>
                  <p className="text-base text-gray-800 mt-1">{formatDistance(place.distanceM)}</p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">별점</p>
                  <p className="text-base text-gray-800 mt-1">⭐ {reviewSummary ? reviewSummary.averageRating : "-"}</p>
                </div>

                <div className="rounded-lg bg-gray-50 p-4">
                  <p className="text-sm text-gray-500">리뷰 수</p>
                  <p className="text-base text-gray-800 mt-1">{reviewSummary ? reviewSummary.reviewCount : 0}</p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-end gap-3">
                <button
                  type="button"
                  onClick={() => void handleOpenSaveModal()}
                  className="px-5 py-2 rounded-lg border border-red-200 text-red-600 font-semibold hover:bg-red-50 transition"
                >
                  저장
                </button>

                <button
                  type="button"
                  onClick={handleReviewWrite}
                  className="px-5 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
                >
                  리뷰 작성하기
                </button>
              </div>

              <div className="rounded-lg border border-gray-100 bg-red-50 p-4">
                <p className="text-sm text-red-700 font-medium">찜 상태</p>
                <p className="text-sm text-red-700 mt-1">
                  {place.liked ? "현재 찜한 맛집입니다." : "아직 찜하지 않은 맛집입니다."}
                </p>
              </div>

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

          <PlaceReviewSection reviews={reviews} isLoading={isReviewLoading} onSelectImage={openImageViewer} />
        </div>
      </div>

      {isSaveModalOpen && (
        <PlaceCollectionSaveModal
          place={place}
          collections={collections}
          isOpen={isSaveModalOpen}
          isLoading={isCollectionLoading}
          onClose={() => setIsSaveModalOpen(false)}
          onRefresh={fetchCollections}
        />
      )}

      {viewerImage && <ImageViewerModal src={viewerImage.src} alt={viewerImage.alt} onClose={closeImageViewer} />}
    </>
  );
};

export default PlaceDetailView;
