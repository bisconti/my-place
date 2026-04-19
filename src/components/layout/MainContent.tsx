/*
  file: MainContent.tsx
  description
  - 메인 화면에서 식당 목록과 지도를 연결하고 검색, 정렬, 필터를 관리하는 컴포넌트
*/
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getPlaceDetail } from "../../api/place/place.api";
import { saveRecentPlaceApi } from "../../api/place/recentPlace.api";
import { useKakaoPlaceMap } from "../../hooks/useKakaoPlaceMap";
import { useAuthStore } from "../../stores/authStore";
import MapPanel from "./MapPanel";
import PlaceListPanel from "./PlaceListPanel";

export default function MainContent() {
  const navigate = useNavigate();
  const [pendingKeyword, setPendingKeyword] = useState("");

  const {
    mapRef,
    places,
    loading,
    selectedId,
    needRefetch,
    refetchHere,
    goMyLocation,
    search,
    toggleLike,
    focusPlaceById,
    sortBy,
    setSortBy,
    filters,
    setFilters,
  } = useKakaoPlaceMap();

  const isLoggedIn = useAuthStore((s) => !!s.user);
  const token = useAuthStore((s) => s.token);

  const handleSelectPlace = (id: string) => {
    focusPlaceById(id);
  };

  const handleOpenPlaceDetail = async (id: string) => {
    const place = await getPlaceDetail(id);

    if (token) {
      void saveRecentPlaceApi({ placeId: id }).catch((error) => {
        console.warn("최근 방문 식당 저장 실패", error);
      });
    }

    navigate(`/places/${id}`, {
      state: { place },
    });
  };

  return (
    <div className="h-full min-h-0 w-full px-4 py-4">
      <div className="grid h-full min-h-0 grid-cols-1 gap-4 lg:grid-cols-12">
        <PlaceListPanel
          places={places}
          loading={loading}
          selectedId={selectedId}
          sortBy={sortBy}
          filters={filters}
          onSelect={handleSelectPlace}
          onOpenDetail={handleOpenPlaceDetail}
          onToggleLike={toggleLike}
          onSortChange={setSortBy}
          onFilterChange={setFilters}
          isLoggedIn={isLoggedIn}
        />

        <div className="lg:col-span-8 xl:col-span-9 h-full min-h-0 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void search(pendingKeyword);
              }}
              className="flex-1"
            >
              <input
                value={pendingKeyword}
                onChange={(e) => setPendingKeyword(e.target.value)}
                className="w-full border rounded-md px-3 py-2 text-sm"
                placeholder="식당, 메뉴, 지역을 검색해보세요"
              />
            </form>

            <button type="button" onClick={goMyLocation} className="px-3 py-2 rounded-md border text-sm">
              내 주변
            </button>
          </div>

          <MapPanel mapRef={mapRef} needRefetch={needRefetch} onRefetch={refetchHere} />
        </div>
      </div>
    </div>
  );
}
