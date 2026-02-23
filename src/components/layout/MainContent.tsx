import { useState } from "react";
import PlaceListPanel from "./PlaceListPanel";
import MapPanel from "./MapPanel";
import { useKakaoPlaceMap } from "../../hooks/useKakaoPlaceMap";
import { useAuthStore } from "../../stores/authStore";

export default function MainContent() {
  const [pendingKeyword, setPendingKeyword] = useState("");

  const {
    mapRef,
    places,
    loading,
    selectedId,
    setSelectedId,
    needRefetch,
    refetchHere,
    goMyLocation,
    search,
    toggleLike,
  } = useKakaoPlaceMap();

  const isLoggedIn = useAuthStore((s) => s.isAuthenticated);

  return (
    <div className="h-full min-h-0 w-full px-4 py-4">
      {/* (먹탐 헤더는 상위 레이아웃에서) */}
      <div className="grid h-full min-h-0 grid-cols-1 gap-4 lg:grid-cols-12">
        <PlaceListPanel
          places={places}
          loading={loading}
          selectedId={selectedId}
          onSelect={setSelectedId}
          onToggleLike={toggleLike}
          isLoggedIn={isLoggedIn}
        />

        <div className="lg:col-span-8 xl:col-span-9 h-full min-h-0 flex flex-col gap-3">
          {/* 검색/내주변은 상단 헤더에 이미 있으면 거기로 옮기는 게 더 자연스럽고,
              아니면 여기 위에 툴바로 넣어도 됨 */}
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
