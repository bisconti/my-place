/*
  file: PlaceListPanel.tsx
  description
  - 식당 목록 선택, 상세 이동, 정렬 및 방송 필터를 처리하는 리스트 패널 컴포넌트
*/
import { useState } from "react";
import type { Place, PlaceListFilterState, PlaceSortOption } from "../../types/place/place.types";

function formatDistance(m?: number) {
  if (m == null) return "";
  if (m < 1000) return `${m}m`;
  return `${(m / 1000).toFixed(1)}km`;
}

type Props = {
  places: Place[];
  loading: boolean;
  selectedId: string | null;
  sortBy: PlaceSortOption;
  filters: PlaceListFilterState;
  onSelect: (id: string) => void;
  onOpenDetail: (id: string) => void;
  onToggleLike: (id: string) => void;
  onSortChange: (value: PlaceSortOption) => void;
  onFilterChange: (next: PlaceListFilterState) => void;
  isLoggedIn: boolean;
};

export default function PlaceListPanel({
  places,
  loading,
  selectedId,
  sortBy,
  filters,
  onSelect,
  onOpenDetail,
  onToggleLike,
  onSortChange,
  onFilterChange,
  isLoggedIn,
}: Props) {
  const [isFilterOpen, setIsFilterOpen] = useState(false);

  const handlePlaceClick = (id: string) => {
    if (id === selectedId) {
      onOpenDetail(id);
      return;
    }
    onSelect(id);
  };

  const updateFilter = (key: keyof PlaceListFilterState, value: boolean) => {
    onFilterChange({
      ...filters,
      [key]: value,
    });
  };

  return (
    <section className="lg:col-span-4 xl:col-span-3 h-full min-h-0 border rounded-lg overflow-hidden flex flex-col bg-white">
      <div className="p-3 border-b shrink-0 space-y-3">
        <div className="flex items-center justify-between">
          <div className="font-semibold">맛집 리스트</div>
          <div className="text-sm text-gray-500">{places.length}개</div>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as PlaceSortOption)}
            className="flex-1 rounded-md border px-3 py-2 text-sm"
          >
            <option value="distance">가까운 순</option>
            <option value="reviewCount">리뷰 많은 순</option>
            <option value="rating">별점 높은 순</option>
            <option value="likeCount">찜 많은 순</option>
          </select>

          <button
            type="button"
            onClick={() => setIsFilterOpen((prev) => !prev)}
            className="px-3 py-2 rounded-md border text-sm hover:bg-gray-50"
          >
            검색필터
          </button>
        </div>

        {isFilterOpen && (
          <div className="rounded-lg border bg-gray-50 p-3 space-y-2 text-sm">
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.featuredLiveInfoTv}
                onChange={(e) => updateFilter("featuredLiveInfoTv", e.target.checked)}
              />
              <span>생생정보통TV 출연</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.featuredLifeMaster}
                onChange={(e) => updateFilter("featuredLifeMaster", e.target.checked)}
              />
              <span>생활의 달인 출연</span>
            </label>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={filters.featuredBaekbanTrip}
                onChange={(e) => updateFilter("featuredBaekbanTrip", e.target.checked)}
              />
              <span>백반기행 출연</span>
            </label>
          </div>
        )}
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        {places.map((p) => {
          const active = p.id === selectedId;
          const imageUrl = p.thumbnail ? `${import.meta.env.VITE_IMAGE_BASE_URL}${p.thumbnail}` : null;

          return (
            <div
              key={p.id}
              role="button"
              tabIndex={0}
              onClick={() => handlePlaceClick(p.id)}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handlePlaceClick(p.id);
                }
              }}
              className={`w-full text-left px-4 py-4 border-b hover:bg-gray-50 cursor-pointer ${
                active ? "bg-red-50" : ""
              }`}
            >
              <div className="flex items-start gap-3">
                <div className="w-24 h-24 rounded-xl overflow-hidden bg-gray-100 shrink-0 border">
                  {imageUrl ? (
                    <img src={imageUrl} alt={p.name} className="w-full h-full object-cover" loading="lazy" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs text-gray-400">이미지 없음</div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="font-semibold text-gray-900 truncate">{p.name}</div>
                      <div className="text-sm text-gray-500 mt-1 break-words">
                        {p.category}
                        {p.distanceM != null ? ` · ${formatDistance(p.distanceM)}` : ""}
                      </div>
                      <div className="text-sm text-gray-500 mt-1 break-words">{p.roadAddress || p.address}</div>
                      <div className="text-sm text-gray-700 mt-2">
                        ⭐ {p.rating ?? "-"} · 리뷰 {p.reviewCount ?? 0} · 찜 {p.likeCount ?? 0}
                      </div>
                    </div>

                    {isLoggedIn && (
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          onToggleLike(p.id);
                        }}
                        className="shrink-0 p-2 rounded-full hover:bg-gray-100 active:scale-95 transition inline-flex items-center justify-center leading-none"
                        aria-label={p.liked ? "찜 해제" : "찜하기"}
                        title={p.liked ? "찜 해제" : "찜하기"}
                      >
                        <svg viewBox="0 0 24 24" className="w-5 h-5 block" aria-hidden="true">
                          <path
                            d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
                            fill={p.liked ? "currentColor" : "none"}
                            stroke={p.liked ? "none" : "currentColor"}
                            strokeWidth={p.liked ? undefined : 1.8}
                            strokeLinejoin="round"
                            strokeLinecap="round"
                            className={p.liked ? "text-red-600" : "text-gray-400"}
                          />
                        </svg>
                      </button>
                    )}
                  </div>

                  <div className="mt-3 flex flex-wrap gap-2">
                    {p.featuredLiveInfoTv && (
                      <span className="rounded-full bg-amber-50 border border-amber-100 px-2.5 py-1 text-xs font-medium text-amber-700">
                        생생정보통TV
                      </span>
                    )}
                    {p.featuredLifeMaster && (
                      <span className="rounded-full bg-emerald-50 border border-emerald-100 px-2.5 py-1 text-xs font-medium text-emerald-700">
                        생활의 달인
                      </span>
                    )}
                    {p.featuredBaekbanTrip && (
                      <span className="rounded-full bg-sky-50 border border-sky-100 px-2.5 py-1 text-xs font-medium text-sky-700">
                        백반기행
                      </span>
                    )}
                  </div>

                  {active && <div className="mt-3 text-xs text-red-600 font-medium">한 번 더 클릭하면 상세 페이지로 이동합니다.</div>}
                </div>
              </div>
            </div>
          );
        })}

        {!loading && places.length === 0 && <div className="p-8 text-center text-gray-500">조건에 맞는 식당이 없습니다.</div>}
        {loading && <div className="p-8 text-center text-gray-500">식당을 불러오는 중입니다...</div>}
      </div>
    </section>
  );
}
