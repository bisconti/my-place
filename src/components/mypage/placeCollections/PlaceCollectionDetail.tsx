/*
  파일명 PlaceCollectionDetail.tsx
  기능
  - 저장 리스트 상세와 저장된 식당 목록을 보여주고 식당 제거 및 리스트 삭제를 처리하는 컴포넌트
*/
import { useCallback, useEffect, useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import toast from "react-hot-toast";
import { deletePlaceCollection, getPlaceCollectionDetail, removePlaceFromCollection } from "../../../api/place/placeCollection.api";
import BackButton from "../../form/BackButton";
import { useAuth } from "../../../hooks/useAuth";
import type { PlaceCollectionDetailResponse } from "../../../types/place/placeCollection.types";
import { formatDateTime } from "../../../utils/common";

const PlaceCollectionDetail = () => {
  const navigate = useNavigate();
  const { collectionId } = useParams();
  const { user } = useAuth();

  const [detail, setDetail] = useState<PlaceCollectionDetailResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [removingPlaceId, setRemovingPlaceId] = useState<string | null>(null);
  const [isDeletingCollection, setIsDeletingCollection] = useState(false);

  const parsedCollectionId = Number(collectionId);

  const fetchDetail = useCallback(async () => {
    if (!Number.isFinite(parsedCollectionId)) {
      toast.error("잘못된 리스트 경로입니다.");
      navigate("/mypage/place-collections");
      return;
    }

    try {
      setIsLoading(true);
      const { data } = await getPlaceCollectionDetail(parsedCollectionId);
      setDetail(data);
    } catch (error) {
      console.error("저장 리스트 상세 조회 실패", error);
      toast.error("저장 리스트를 불러오지 못했습니다.");
      navigate("/mypage/place-collections");
    } finally {
      setIsLoading(false);
    }
  }, [navigate, parsedCollectionId]);

  useEffect(() => {
    if (!user) return;
    void fetchDetail();
  }, [user, fetchDetail]);

  const handleRemovePlace = async (placeId: string) => {
    if (!detail) return;

    const confirmed = window.confirm("이 식당을 리스트에서 제거할까요?");
    if (!confirmed) return;

    try {
      setRemovingPlaceId(placeId);
      await removePlaceFromCollection(detail.collectionId, placeId);
      toast.success("리스트에서 제거했어요.");
      await fetchDetail();
    } catch (error) {
      console.error("리스트 식당 제거 실패", error);
      toast.error("식당 제거에 실패했습니다.");
    } finally {
      setRemovingPlaceId(null);
    }
  };

  const handleDeleteCollection = async () => {
    if (!detail) return;

    const confirmed = window.confirm(`'${detail.name}' 리스트를 삭제할까요? 저장된 식당도 함께 목록에서 사라집니다.`);
    if (!confirmed) return;

    try {
      setIsDeletingCollection(true);
      await deletePlaceCollection(detail.collectionId);
      toast.success("저장 리스트를 삭제했어요.");
      navigate("/mypage/place-collections");
    } catch (error) {
      console.error("저장 리스트 삭제 실패", error);
      toast.error("저장 리스트 삭제에 실패했습니다.");
    } finally {
      setIsDeletingCollection(false);
    }
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative mb-6">
          <BackButton path="/mypage/place-collections" />
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-red-600">저장 리스트 상세</h1>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">리스트를 불러오는 중입니다...</div>
        ) : !detail ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">리스트 정보를 찾지 못했습니다.</div>
        ) : (
          <>
            <div className="bg-white rounded-xl shadow-md p-6 mb-6">
              <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                <div>
                  <h2 className="text-2xl font-bold text-gray-900">{detail.name}</h2>
                  <p className="text-sm text-gray-500 mt-2">저장된 식당 {detail.placeCount}곳</p>
                  <p className="text-xs text-gray-400 mt-3">최근 수정 {formatDateTime(detail.updatedAt)}</p>
                </div>

                <button
                  type="button"
                  onClick={() => void handleDeleteCollection()}
                  disabled={isDeletingCollection}
                  className="px-4 py-2 rounded-lg border border-red-200 text-red-600 hover:bg-red-50 disabled:bg-gray-100 disabled:text-gray-400"
                >
                  {isDeletingCollection ? "삭제 중..." : "리스트 삭제"}
                </button>
              </div>
            </div>

            {detail.items.length === 0 ? (
              <div className="bg-white rounded-xl shadow-md p-8 text-center">
                <p className="text-gray-700 font-medium">아직 저장된 식당이 없어요.</p>
                <p className="text-sm text-gray-500 mt-2">메인 화면이나 식당 상세에서 저장 버튼을 눌러 채워보세요.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {detail.items.map((item) => {
                  const imageUrl = item.thumbnail ? `${import.meta.env.VITE_IMAGE_BASE_URL}${item.thumbnail}` : null;

                  return (
                    <div
                      key={item.collectionItemId}
                      className="bg-white rounded-xl shadow-md p-5 border border-gray-100 flex flex-col md:flex-row gap-5"
                    >
                      <button
                        type="button"
                        onClick={() => navigate(`/places/${item.placeId}`)}
                        className="md:w-56 shrink-0 overflow-hidden rounded-xl bg-gray-100 border text-left"
                      >
                        {imageUrl ? (
                          <img src={imageUrl} alt={item.placeName} className="w-full h-40 object-cover" loading="lazy" />
                        ) : (
                          <div className="w-full h-40 flex items-center justify-center text-sm text-gray-400">
                            이미지 없음
                          </div>
                        )}
                      </button>

                      <div className="flex-1 min-w-0">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                          <div>
                            <button
                              type="button"
                              onClick={() => navigate(`/places/${item.placeId}`)}
                              className="text-left"
                            >
                              <h3 className="text-lg font-bold text-gray-900 hover:text-red-600">{item.placeName}</h3>
                            </button>
                            <p className="text-sm text-gray-500 mt-1">{item.category || "카테고리 정보 없음"}</p>
                            <p className="text-sm text-gray-600 mt-3">{item.roadAddress || item.address || "주소 정보 없음"}</p>
                            <p className="text-xs text-gray-400 mt-3">리스트 저장일 {formatDateTime(item.savedAt)}</p>
                          </div>

                          <div className="shrink-0 text-sm text-gray-600">
                            <p>별점 {item.rating ?? "-"}</p>
                            <p className="mt-1">리뷰 {item.reviewCount ?? 0}개</p>
                          </div>
                        </div>

                        <div className="mt-5 flex justify-end">
                          <button
                            type="button"
                            onClick={() => void handleRemovePlace(item.placeId)}
                            disabled={removingPlaceId === item.placeId}
                            className="px-4 py-2 rounded-lg border border-gray-300 text-sm text-gray-700 hover:bg-gray-50 disabled:bg-gray-100 disabled:text-gray-400"
                          >
                            {removingPlaceId === item.placeId ? "제거 중..." : "리스트에서 제거"}
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default PlaceCollectionDetail;
