import { useCallback, useRef, type RefObject } from "react";
import type { KakaoCircle, KakaoMap, KakaoMarker, KakaoMarkerImage } from "../types/kakaoMap.types";
import type { BrowserLocation, LocationSource, SavedLocation } from "../utils/kakaoPlaceMap";

export function useKakaoCurrentLocationOverlay(mapRef: RefObject<KakaoMap | null>) {
  const markerRef = useRef<KakaoMarker | null>(null);
  const circleRef = useRef<KakaoCircle | null>(null);
  const markerImageRef = useRef<KakaoMarkerImage | null>(null);

  const getMarkerImage = useCallback(() => {
    const kakao = window.kakao;

    if (markerImageRef.current) {
      return markerImageRef.current;
    }

    const markerSvg = encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="34" height="42" viewBox="0 0 34 42">
        <path fill="#dc2626" stroke="#ffffff" stroke-width="3" d="M17 2C8.7 2 2 8.7 2 17c0 11.3 15 23 15 23s15-11.7 15-23C32 8.7 25.3 2 17 2z"/>
        <circle cx="17" cy="17" r="6" fill="#ffffff"/>
      </svg>
    `);

    markerImageRef.current = new kakao.maps.MarkerImage(
      `data:image/svg+xml;charset=UTF-8,${markerSvg}`,
      new kakao.maps.Size(34, 42),
      { offset: new kakao.maps.Point(17, 42) }
    );

    return markerImageRef.current;
  }, []);

  const renderCurrentLocation = useCallback(
    (location: BrowserLocation | SavedLocation, source: LocationSource) => {
      const kakao = window.kakao;
      const map = mapRef.current;
      if (!map) return;

      const position = new kakao.maps.LatLng(location.lat, location.lng);

      if (!markerRef.current) {
        markerRef.current = new kakao.maps.Marker({
          position,
          image: getMarkerImage(),
          title: source === "browser" ? "브라우저 현재 위치" : "저장 위치",
          zIndex: 10,
        });
      } else {
        markerRef.current.setPosition(position);
      }

      markerRef.current.setMap(map);

      if (source === "browser" && "accuracyM" in location && location.accuracyM) {
        if (!circleRef.current) {
          circleRef.current = new kakao.maps.Circle({
            center: position,
            radius: location.accuracyM,
            strokeWeight: 2,
            strokeColor: "#dc2626",
            strokeOpacity: 0.55,
            fillColor: "#ef4444",
            fillOpacity: 0.12,
            zIndex: 2,
          });
        } else {
          circleRef.current.setPosition(position);
          circleRef.current.setRadius(location.accuracyM);
        }

        circleRef.current.setMap(map);
        return;
      }

      circleRef.current?.setMap(null);
    },
    [getMarkerImage, mapRef]
  );

  return { renderCurrentLocation };
}
