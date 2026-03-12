/*
  파일명: FavoritesList.tsx
  describe
  - 마이페이지 내 찜한 맛집 목록 component
  - 전체선택 / 개별선택 / 선택삭제 기능 제공
*/
import { useCallback, useEffect, useMemo, useState } from "react";
import { Navigate, useNavigate } from "react-router-dom";
import { useAuth } from "../../../hooks/useAuth";
import type { PlaceLikeResponse } from "../../../types/place/placeLike.types";
import { getMyPlaceLikes, togglePlaceLikeByPayload } from "../../../api/placeLike.api";
import BackButton from "../../form/BackButton";
import { formatDateTime } from "../../../utils/common";

const FavoritesList = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);
  const [favorites, setFavorites] = useState<PlaceLikeResponse[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchFavorites = useCallback(async () => {
    setIsLoading(true);
    setApiError(null);

    try {
      const { data } = await getMyPlaceLikes();
      setFavorites(data.items ?? []);
      setSelectedIds([]);
    } catch (error) {
      console.error("찜 목록 조회 실패", error);
      setApiError("찜한 맛집 목록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!user) return;
    fetchFavorites();
  }, [user, fetchFavorites]);

  const allIds = useMemo(() => favorites.map((item) => item.placeId), [favorites]);

  const isAllChecked = favorites.length > 0 && selectedIds.length === favorites.length;

  const handleToggleAll = () => {
    if (isAllChecked) {
      setSelectedIds([]);
      return;
    }
    setSelectedIds(allIds);
  };

  const handleToggleOne = (placeId: string) => {
    setSelectedIds((prev) => (prev.includes(placeId) ? prev.filter((id) => id !== placeId) : [...prev, placeId]));
  };

  const handleDeleteSelected = async () => {
    if (selectedIds.length === 0) {
      alert("삭제할 목록을 선택해 주세요.");
      return;
    }

    const ok = window.confirm("선택한 찜 목록을 삭제하시겠습니까?");
    if (!ok) return;

    try {
      setIsDeleting(true);

      const targets = favorites.filter((item) => selectedIds.includes(item.placeId));

      await Promise.all(
        targets.map((item) =>
          togglePlaceLikeByPayload({
            placeId: item.placeId,
            placeName: item.placeName,
            address: item.address,
            category: item.category,
            liked: false,
          })
        )
      );

      await fetchFavorites();
      alert("선택한 찜 목록이 삭제되었습니다.");
    } catch (error) {
      console.error("찜 선택 삭제 실패", error);
      alert("선택 삭제에 실패했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsDeleting(false);
    }
  };

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="relative mb-6">
          <BackButton path="/mypage" />
          <h1 className="text-2xl sm:text-3xl font-bold text-center text-red-600">찜한 맛집</h1>
          <p className="text-center text-gray-500 mt-2">내가 저장한 맛집 목록을 확인할 수 있어요.</p>
        </div>

        {isLoading ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center text-gray-500">
            찜한 맛집 목록을 불러오는 중입니다...
          </div>
        ) : apiError ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-sm text-red-500">{apiError}</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <p className="text-gray-700 font-medium">아직 찜한 맛집이 없어요.</p>
            <p className="text-sm text-gray-500 mt-2">마음에 드는 맛집을 저장해보세요.</p>

            <button
              type="button"
              onClick={() => navigate("/")}
              className="mt-4 px-4 py-2 text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 transition"
            >
              맛집 찾으러 가기
            </button>
          </div>
        ) : (
          <>
            {/* 상단 툴바 */}
            <div className="bg-white rounded-xl shadow-md p-4 mb-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <label className="inline-flex items-center gap-2 text-sm text-gray-700 cursor-pointer">
                <input
                  type="checkbox"
                  checked={isAllChecked}
                  onChange={handleToggleAll}
                  disabled={isDeleting}
                  className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                />
                <span>전체선택</span>
              </label>

              <div className="flex items-center gap-3">
                <span className="text-sm text-gray-500">
                  선택 {selectedIds.length}건 / 전체 {favorites.length}건
                </span>

                <button
                  type="button"
                  onClick={handleDeleteSelected}
                  disabled={isDeleting}
                  className="px-4 py-2 text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition"
                >
                  {isDeleting ? "삭제 중..." : "선택 삭제"}
                </button>
              </div>
            </div>

            {/* 목록 */}
            <div className="space-y-4">
              {favorites.map((place) => {
                const checked = selectedIds.includes(place.placeId);

                return (
                  <div
                    key={place.placeId}
                    className={`bg-white rounded-xl shadow-md p-5 border transition ${
                      checked ? "border-red-300 ring-1 ring-red-100" : "border-gray-100 hover:shadow-lg"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      {/* 체크박스 */}
                      <div className="pt-1 shrink-0">
                        <input
                          type="checkbox"
                          checked={checked}
                          onChange={() => handleToggleOne(place.placeId)}
                          disabled={isDeleting}
                          className="h-4 w-4 rounded border-gray-300 text-red-600 focus:ring-red-500"
                        />
                      </div>

                      {/* 내용 */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-4">
                          <div className="min-w-0">
                            <h2 className="text-lg font-bold text-gray-900">{place.placeName || "이름 없는 장소"}</h2>

                            <p className="text-sm text-gray-500 mt-1">{place.category || "카테고리 정보 없음"}</p>

                            <p className="text-sm text-gray-600 mt-2 break-words">
                              {place.address || "주소 정보 없음"}
                            </p>

                            {place.createdAt && (
                              <p className="text-xs text-gray-400 mt-3">저장일: {formatDateTime(place.createdAt)}</p>
                            )}
                          </div>

                          <div className="shrink-0">
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-red-50 text-red-600 border border-red-100">
                              찜 완료
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </>
        )}

        <div className="h-10" />
      </div>
    </div>
  );
};

export default FavoritesList;
