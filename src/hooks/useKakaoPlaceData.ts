/*
  file: useKakaoPlaceData.ts
  description
  - 카카오 장소 검색 결과와 서비스 메타데이터 병합을 담당하는 훅
*/
import { useCallback, type Dispatch, type SetStateAction } from "react";
import { getPlaceListMetadata } from "../api/place/place.api";
import type { KakaoMap, KakaoPlaces } from "../types/kakaoMap.types";
import type { Place } from "../types/place/place.types";
import { mergePlaceListMetadata } from "../utils/placeList";
import { searchPlacesInCurrentBounds } from "../utils/kakaoPlaceMap";

type UseKakaoPlaceDataParams = {
  keyword: string;
  likedIds: Set<string>;
  renderMarkers: (items: Place[]) => void;
  setBasePlaces: Dispatch<SetStateAction<Place[]>>;
  setLoading: Dispatch<SetStateAction<boolean>>;
};

export function useKakaoPlaceData({
  keyword,
  likedIds,
  renderMarkers,
  setBasePlaces,
  setLoading,
}: UseKakaoPlaceDataParams) {
  return useCallback(
    async (map: KakaoMap | null, placesService: KakaoPlaces | null, overrideKeyword?: string) => {
      if (!map || !placesService) return;

      const resolvedKeyword = (overrideKeyword ?? keyword).trim() || "맛집";
      setLoading(true);

      try {
        const nearbyPlaces = await searchPlacesInCurrentBounds(placesService, map, resolvedKeyword, likedIds);

        if (nearbyPlaces.length === 0) {
          setBasePlaces([]);
          renderMarkers([]);
          return;
        }

        try {
          const metadata = await getPlaceListMetadata({
            placeIds: nearbyPlaces.map((place) => place.id),
          });

          const enrichedPlaces = mergePlaceListMetadata(nearbyPlaces, metadata, likedIds);
          setBasePlaces(enrichedPlaces);
          renderMarkers(enrichedPlaces);
        } catch (error) {
          console.error("식당 목록 메타데이터 조회 실패", error);
          setBasePlaces(nearbyPlaces);
          renderMarkers(nearbyPlaces);
        }
      } finally {
        setLoading(false);
      }
    },
    [keyword, likedIds, renderMarkers, setBasePlaces, setLoading]
  );
}
