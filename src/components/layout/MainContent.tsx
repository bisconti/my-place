import { useEffect, useMemo, useState } from "react";
import { Map } from "react-kakao-maps-sdk";

declare global {
  interface Window {
    kakao: any;
  }
}

type Place = {
  id: string;
  name: string;
  category: string;
  rating: number;
  reviewCount: number;
  distanceM: number;
  address: string;
  liked: boolean;
};

const initialPlaces: Place[] = [
  {
    id: "1",
    name: "준민이네 파스타",
    category: "양식",
    rating: 4.6,
    reviewCount: 128,
    distanceM: 420,
    address: "서울시 강남구 ...",
    liked: false,
  },
  {
    id: "2",
    name: "해장국 맛집",
    category: "한식",
    rating: 4.3,
    reviewCount: 89,
    distanceM: 780,
    address: "서울시 서초구 ...",
    liked: true,
  },
];

const MainContent = () => {
  const [q, setQ] = useState("");
  const [sort, setSort] = useState<"distance" | "rating" | "reviews">("distance");
  const [onlyLiked, setOnlyLiked] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [allPlaces, setAllPlaces] = useState<Place[]>(initialPlaces);

  const places = useMemo(() => {
    let list = allPlaces.filter((p) => p.name.includes(q) || p.category.includes(q));
    if (onlyLiked) list = list.filter((p) => p.liked);

    if (sort === "distance") list = [...list].sort((a, b) => a.distanceM - b.distanceM);
    if (sort === "rating") list = [...list].sort((a, b) => b.rating - a.rating);
    if (sort === "reviews") list = [...list].sort((a, b) => b.reviewCount - a.reviewCount);

    return list;
  }, [allPlaces, q, sort, onlyLiked]);

  const [kakaoReady, setKakaoReady] = useState(false);

  useEffect(() => {
    const check = () => {
      if (window.kakao?.maps) {
        setKakaoReady(true);
        return true;
      }
      return false;
    };

    if (check()) return;

    const id = window.setInterval(() => {
      if (check()) window.clearInterval(id);
    }, 50);

    return () => window.clearInterval(id);
  }, []);

  const selected = useMemo(() => places.find((p) => p.id === selectedId) ?? null, [places, selectedId]);

  const toggleLike = (id: string) => {
    setAllPlaces((prev) => prev.map((p) => (p.id === id ? { ...p, liked: !p.liked } : p)));

    // TODO: 나중에 API 붙일 때 여기서 호출 (낙관적 업데이트)
    // api.post(`/place/${id}/like`) ...
  };

  const HeartIcon = ({ filled }) => (
    <svg
      viewBox="0 0 24 24"
      className="w-5 h-5 block" // ✅ block: baseline 여백 제거
      aria-hidden="true"
    >
      <path
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"
        fill={filled ? "currentColor" : "none"} // ✅ 같은 path
        stroke={filled ? "none" : "currentColor"} // ✅ outline만 stroke
        strokeWidth={filled ? undefined : 1.8} // ✅ 두께 적당히
        strokeLinejoin="round"
        strokeLinecap="round"
      />
    </svg>
  );

  return (
    <main className="max-w-7xl mx-auto mt-6 p-4">
      {/* 상단 검색/필터 바 */}
      <div className="bg-white rounded-xl shadow-sm border p-4 sticky top-4 z-10">
        <div className="flex flex-col md:flex-row gap-3 md:items-center">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="가게명/메뉴/카테고리 검색"
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
          />

          <select
            value={sort}
            onChange={(e) => setSort(e.target.value as any)}
            className="px-3 py-2 border rounded-lg bg-white"
          >
            <option value="distance">거리순</option>
            <option value="rating">별점순</option>
            <option value="reviews">리뷰많은순</option>
          </select>

          <label className="flex items-center gap-2 text-sm text-gray-700">
            <input type="checkbox" checked={onlyLiked} onChange={(e) => setOnlyLiked(e.target.checked)} />
            찜한 곳만
          </label>

          <button className="px-4 py-2 rounded-lg bg-red-600 text-white hover:bg-red-700">내 주변</button>
        </div>
      </div>

      {/* 본문: 좌 리스트 / 우 지도 */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* 리스트 */}
        <section className="lg:col-span-5 bg-white rounded-xl border shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b flex items-center justify-between">
            <h3 className="font-semibold text-gray-800">맛집 리스트</h3>
            <span className="text-sm text-gray-500">{places.length}개</span>
          </div>

          <div className="max-h-[70vh] overflow-auto">
            {places.map((p) => {
              const active = p.id === selectedId;
              return (
                <button
                  key={p.id}
                  onClick={() => setSelectedId(p.id)}
                  className={`w-full text-left px-4 py-4 border-b hover:bg-gray-50 ${active ? "bg-red-50" : ""}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="font-semibold text-gray-900">{p.name}</div>
                      <div className="text-sm text-gray-500 mt-1">
                        {p.category} · {p.distanceM}m · {p.address}
                      </div>
                      <div className="text-sm text-gray-700 mt-2">
                        ⭐ {p.rating} · 리뷰 {p.reviewCount}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleLike(p.id);
                      }}
                      className="shrink-0 p-2 rounded-full hover:bg-gray-100 active:scale-95 transition inline-flex items-center justify-center leading-none"
                      aria-label={p.liked ? "찜 해제" : "찜 하기"}
                      title={p.liked ? "찜 해제" : "찜 하기"}
                    >
                      <span className={p.liked ? "text-red-600" : "text-gray-400"}>
                        <HeartIcon filled={p.liked} />
                      </span>
                    </button>
                  </div>
                </button>
              );
            })}

            {places.length === 0 && <div className="p-8 text-center text-gray-500">검색 결과가 없어요.</div>}
          </div>
        </section>

        {/* 지도 + 상세 */}
        <section className="lg:col-span-7 space-y-4">
          {/* 지도 영역 */}
          <div className="h-[50vh] bg-white rounded-xl border shadow-sm overflow-hidden">
            {!kakaoReady ? (
              <div className="w-full h-full flex items-center justify-center text-gray-500">지도 불러오는 중...</div>
            ) : (
              <Map center={{ lat: 37.5665, lng: 126.978 }} style={{ width: "100%", height: "100%" }} level={4} />
            )}
          </div>

          {/* 선택 상세 */}
          <div className="bg-white rounded-xl border shadow-sm p-4">
            {selected ? (
              <>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-bold text-gray-900">{selected.name}</h4>
                    <div className="text-sm text-gray-500 mt-1">
                      {selected.category} · {selected.address}
                    </div>
                    <div className="text-sm text-gray-700 mt-2">
                      ⭐ {selected.rating} · 리뷰 {selected.reviewCount} · {selected.distanceM}m
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <button className="px-3 py-2 text-sm rounded-lg border hover:bg-gray-50">찜</button>
                    <button className="px-3 py-2 text-sm rounded-lg bg-red-600 text-white hover:bg-red-700">
                      리뷰 쓰기
                    </button>
                  </div>
                </div>
              </>
            ) : (
              <div className="text-gray-500">리스트에서 가게를 선택하면 상세가 보여요.</div>
            )}
          </div>
        </section>
      </div>
    </main>
  );
};

export default MainContent;
