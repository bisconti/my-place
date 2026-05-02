import { useCallback, type RefObject } from "react";
import type { KakaoMap, KakaoMarker } from "../types/kakaoMap.types";
import type { Place } from "../types/place/place.types";

type UseKakaoPlaceMarkersOptions = {
  mapRef: RefObject<KakaoMap | null>;
  markersRef: RefObject<Map<string, KakaoMarker>>;
  placeByIdRef: RefObject<Map<string, Place>>;
  onSelectMarker: (placeId: string) => void;
  openInfo: (place: Place) => void;
};

export function useKakaoPlaceMarkers({
  mapRef,
  markersRef,
  placeByIdRef,
  onSelectMarker,
  openInfo,
}: UseKakaoPlaceMarkersOptions) {
  const renderMarkers = useCallback(
    (items: Place[]) => {
      const kakao = window.kakao;
      const map = mapRef.current;

      const nextIds = new Set(items.map((place) => place.id));
      for (const [id, marker] of markersRef.current.entries()) {
        if (!nextIds.has(id)) {
          marker.setMap(null);
          markersRef.current.delete(id);
        }
      }

      items.forEach((place) => {
        const existingMarker = markersRef.current.get(place.id);
        const position = new kakao.maps.LatLng(place.lat, place.lng);

        if (!existingMarker) {
          const marker = new kakao.maps.Marker({ position });
          if (map) {
            marker.setMap(map);
          }

          kakao.maps.event.addListener(marker, "click", () => {
            const latestPlace = placeByIdRef.current.get(place.id) ?? place;
            onSelectMarker(latestPlace.id);
            openInfo(latestPlace);
          });

          markersRef.current.set(place.id, marker);
          return;
        }

        existingMarker.setPosition(position);
      });
    },
    [mapRef, markersRef, onSelectMarker, openInfo, placeByIdRef]
  );

  return { renderMarkers };
}
