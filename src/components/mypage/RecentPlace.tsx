import { useCallback, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRecentPlacesApi } from "../../api/place/recentPlace.api";
import type { RecentPlace as RecentPlaceItem } from "../../types/place/place.types";
import { formatDateTime } from "../../utils/common";

const RecentPlace = () => {
  const navigate = useNavigate();

  const [recentPlaces, setRecentPlaces] = useState<RecentPlaceItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchRecentPlaces = useCallback(async () => {
    try {
      setIsLoading(true);
      setError("");

      const data = await getRecentPlacesApi();
      setRecentPlaces(data);
    } catch (err) {
      console.error("최근 방문 식당 조회 실패", err);
      setError("최근 방문 기록을 불러오지 못했습니다. 잠시 후 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchRecentPlaces();
  }, [fetchRecentPlaces]);

  return (
    <section className="bg-white rounded-xl shadow-md p-6 mb-6">
      <div className="flex items-center justify-between gap-3 mb-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">최근 방문 기록</h2>
          <p className="text-sm text-gray-500 mt-1">최근에 둘러본 식당을 다시 확인해보세요.</p>
        </div>

        <button
          type="button"
          onClick={fetchRecentPlaces}
          className="px-3 py-2 text-sm font-medium rounded-lg border border-gray-200 text-gray-700 hover:bg-gray-50 transition"
        >
          새로고침
        </button>
      </div>

      {isLoading ? (
        <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-8 text-center text-sm text-gray-500">
          최근 방문 기록을 불러오는 중입니다...
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-8 text-center text-sm text-red-600">
          {error}
        </div>
      ) : recentPlaces.length === 0 ? (
        <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-8 text-center">
          <p className="text-gray-700 font-medium">아직 최근 방문 기록이 없습니다.</p>
          <p className="text-sm text-gray-500 mt-2">식당 상세 페이지를 둘러보면 이곳에 기록이 쌓입니다.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {recentPlaces.map((place) => (
            <button
              key={place.id}
              type="button"
              onClick={() => navigate(`/places/${place.id}`)}
              className="w-full text-left rounded-xl border border-gray-100 hover:border-red-200 hover:bg-red-50/40 transition overflow-hidden"
            >
              <div className="flex items-stretch">
                <div className="w-24 h-24 shrink-0 bg-gray-100 overflow-hidden">
                  {place.thumbnail ? (
                    <img src={place.thumbnail} alt={place.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-xs font-medium text-gray-400">
                      이미지 없음
                    </div>
                  )}
                </div>

                <div className="flex-1 p-4 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="text-base font-semibold text-gray-900 truncate">{place.name}</p>
                      <p className="text-xs text-gray-500 mt-1">최근 방문: {formatDateTime(place.viewedAt)}</p>
                    </div>

                    {typeof place.rating === "number" && (
                      <span className="shrink-0 inline-flex items-center rounded-full bg-yellow-50 px-2.5 py-1 text-xs font-semibold text-yellow-700">
                        {place.rating.toFixed(1)}
                      </span>
                    )}
                  </div>

                  {typeof place.reviewCount === "number" && (
                    <p className="text-sm text-gray-500 mt-3">리뷰 {place.reviewCount}개</p>
                  )}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}
    </section>
  );
};

export default RecentPlace;
