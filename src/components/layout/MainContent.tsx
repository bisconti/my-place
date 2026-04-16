/*
  file: MainContent.tsx
  description
  - 메인 화면의 식당 목록과 지도 영역을 연결하는 컴포넌트
*/
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import PlaceListPanel from "./PlaceListPanel";
import MapPanel from "./MapPanel";
import { useKakaoPlaceMap } from "../../hooks/useKakaoPlaceMap";
import { useAuthStore } from "../../stores/authStore";
import { getPlaceDetail } from "../../api/place/place.api";
import { saveRecentPlaceApi } from "../../api/place/recentPlace.api";

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
  } = useKakaoPlaceMap();

  const isLoggedIn = useAuthStore((s) => !!s.user);
  const token = useAuthStore((s) => s.token);

  const handleSelectPlace = (id: string) => {
    focusPlaceById(id);
  };

  const handleOpenPlaceDetail = async (id: string) => {
    //  const place = places.find((p) => p.id === id);
    //  if (!place) return;
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
          onSelect={handleSelectPlace}
          onOpenDetail={handleOpenPlaceDetail}
          onToggleLike={toggleLike}
          isLoggedIn={isLoggedIn}
        />

        <div className="lg:col-span-8 xl:col-span-9 h-full min-h-0 flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                search(pendingKeyword);
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

            <button onClick={goMyLocation} className="px-3 py-2 rounded-md border text-sm">
              내 주변
            </button>
          </div>

          <MapPanel mapRef={mapRef} needRefetch={needRefetch} onRefetch={refetchHere} />
        </div>
      </div>
    </div>
  );
}
