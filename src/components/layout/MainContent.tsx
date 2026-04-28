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
  const [savedAddressInput, setSavedAddressInput] = useState("");
  const [isLocationPanelOpen, setIsLocationPanelOpen] = useState(false);

  const {
    mapRef,
    places,
    loading,
    selectedId,
    needRefetch,
    refetchHere,
    goMyLocation,
    locationSource,
    setLocationSource,
    savedLocation,
    saveLocationByAddress,
    saveCurrentCenterAsLocation,
    isLocating,
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

  const handleSaveAddress = async () => {
    const saved = await saveLocationByAddress(savedAddressInput);
    if (saved) {
      setSavedAddressInput("");
    }
  };

  return (
    <div className="h-full min-h-0 w-full overflow-hidden px-4 py-4">
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

        <div className="lg:col-span-8 xl:col-span-9 h-full min-h-0 flex flex-col gap-3 overflow-hidden">
          <div className="shrink-0 space-y-2">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                void search(pendingKeyword);
              }}
              className="flex items-center gap-2"
            >
              <input
                value={pendingKeyword}
                onChange={(e) => setPendingKeyword(e.target.value)}
                className="flex-1 border rounded-md px-3 py-2 text-sm"
                placeholder="식당, 메뉴, 지역을 검색해보세요"
              />

              <button type="submit" className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50">
                검색
              </button>
            </form>

            <div className="flex flex-wrap items-center gap-2">
              <div className="inline-flex rounded-md border overflow-hidden text-sm">
                <button
                  type="button"
                  onClick={() => setLocationSource("browser")}
                  className={`px-3 py-2 ${locationSource === "browser" ? "bg-red-600 text-white" : "bg-white hover:bg-gray-50"}`}
                >
                  브라우저 위치
                </button>
                <button
                  type="button"
                  onClick={() => setLocationSource("saved")}
                  className={`px-3 py-2 border-l ${locationSource === "saved" ? "bg-red-600 text-white" : "bg-white hover:bg-gray-50"}`}
                >
                  저장 위치
                </button>
              </div>

              <button
                type="button"
                onClick={() => void goMyLocation()}
                disabled={isLocating}
                className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50 disabled:cursor-not-allowed disabled:bg-gray-100 disabled:text-gray-400"
              >
                {isLocating ? "이동 중..." : "내 주변"}
              </button>

              <button
                type="button"
                onClick={() => setIsLocationPanelOpen((prev) => !prev)}
                className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50"
              >
                위치 설정
              </button>

              {savedLocation && (
                <span className="text-xs text-gray-500 truncate max-w-full sm:max-w-xs">
                  저장 위치: {savedLocation.address}
                </span>
              )}
            </div>

            {isLocationPanelOpen && (
              <div className="rounded-lg border bg-gray-50 p-3 space-y-2">
                <div className="flex flex-col sm:flex-row gap-2">
                  <input
                    value={savedAddressInput}
                    onChange={(e) => setSavedAddressInput(e.target.value)}
                    className="flex-1 border rounded-md px-3 py-2 text-sm bg-white"
                    placeholder="저장할 주소를 입력하세요"
                  />
                  <button
                    type="button"
                    onClick={() => void handleSaveAddress()}
                    className="px-3 py-2 rounded-md border bg-white text-sm hover:bg-gray-50"
                  >
                    주소 저장
                  </button>
                  <button
                    type="button"
                    onClick={() => void saveCurrentCenterAsLocation()}
                    className="px-3 py-2 rounded-md border bg-white text-sm hover:bg-gray-50"
                  >
                    현재 중심 저장
                  </button>
                </div>
              </div>
            )}
          </div>

          <MapPanel mapRef={mapRef} needRefetch={needRefetch} onRefetch={refetchHere} />
        </div>
      </div>
    </div>
  );
}
