export type Place = {
  id: string;
  name: string;
  category: string;
  address: string;
  distanceM?: number;
  rating?: number;
  reviewCount?: number;
  liked?: boolean;
};

function formatDistance(m?: number) {
  if (m == null) return "";
  if (m < 1000) return `${m}m`;
  return `${(m / 1000).toFixed(1)}km`;
}

type Props = {
  places: Place[];
  loading: boolean;
  selectedId: string | null;
  onSelect: (id: string) => void;
  onToggleLike: (id: string) => void;
  isLoggedIn: boolean;
};

export default function PlaceListPanel({ places, loading, selectedId, onSelect, onToggleLike, isLoggedIn }: Props) {
  return (
    <section className="lg:col-span-4 xl:col-span-3 h-full min-h-0 border rounded-lg overflow-hidden flex flex-col">
      <div className="p-3 border-b flex items-center justify-between shrink-0">
        <div className="font-semibold">맛집 리스트</div>
        <div className="text-sm text-gray-500">{places.length}개</div>
      </div>

      <div className="flex-1 min-h-0 overflow-auto">
        {places.map((p) => {
          const active = p.id === selectedId;
          return (
            <div
              key={p.id}
              role="button"
              tabIndex={0}
              onClick={() => onSelect(p.id)}
              className={`w-full text-left px-4 py-4 border-b hover:bg-gray-50 ${active ? "bg-red-50" : ""}`}
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-gray-900">{p.name}</div>
                  <div className="text-sm text-gray-500 mt-1">
                    {p.category}
                    {p.distanceM != null ? ` · ${formatDistance(p.distanceM)}` : ""} · {p.address}
                  </div>
                  <div className="text-sm text-gray-700 mt-2">
                    ⭐ {p.rating ?? "-"} · 리뷰 {p.reviewCount ?? "-"}
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
                    aria-label={p.liked ? "찜 해제" : "찜 하기"}
                    title={p.liked ? "찜 해제" : "찜 하기"}
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
            </div>
          );
        })}

        {!loading && places.length === 0 && <div className="p-8 text-center text-gray-500">검색 결과가 없어요.</div>}
        {loading && <div className="p-8 text-center text-gray-500">검색 중...</div>}
      </div>
    </section>
  );
}
