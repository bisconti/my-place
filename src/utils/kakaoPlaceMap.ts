/*
  file: kakaoPlaceMap.ts
  description
  - 카카오 지도 중심 좌표 저장, 위치 조회, 장소 검색 결과 변환 유틸을 모아둔 파일
*/
import type { Place } from "../types/place/place.types";
import type { KakaoMap, KakaoPlaceResult, KakaoPlaces } from "../types/kakaoMap.types";

export const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 };
const MAP_STATE_KEY = "kakao-place-map-state";
const LOCATION_SOURCE_KEY = "kakao-place-location-source";
const SAVED_LOCATION_KEY = "kakao-place-saved-location";

export type MapCenter = {
  lat: number;
  lng: number;
};

export type LocationSource = "browser" | "saved";

export type SavedLocation = MapCenter & {
  address: string;
};

export type BrowserLocation = MapCenter & {
  accuracyM?: number;
};

export function readSavedMapCenter(): MapCenter | null {
  try {
    const raw = window.sessionStorage.getItem(MAP_STATE_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<MapCenter>;
    if (typeof parsed.lat !== "number" || typeof parsed.lng !== "number") {
      return null;
    }

    return { lat: parsed.lat, lng: parsed.lng };
  } catch {
    return null;
  }
}

export function readLocationSource(): LocationSource {
  try {
    const raw = window.localStorage.getItem(LOCATION_SOURCE_KEY);
    return raw === "saved" ? "saved" : "browser";
  } catch {
    return "browser";
  }
}

export function saveLocationSource(source: LocationSource) {
  try {
    window.localStorage.setItem(LOCATION_SOURCE_KEY, source);
  } catch {
    // ignore storage failures
  }
}

export function readSavedLocation(): SavedLocation | null {
  try {
    const raw = window.localStorage.getItem(SAVED_LOCATION_KEY);
    if (!raw) return null;

    const parsed = JSON.parse(raw) as Partial<SavedLocation>;
    if (
      typeof parsed.address !== "string" ||
      typeof parsed.lat !== "number" ||
      typeof parsed.lng !== "number"
    ) {
      return null;
    }

    return { address: parsed.address, lat: parsed.lat, lng: parsed.lng };
  } catch {
    return null;
  }
}

export function saveSavedLocation(location: SavedLocation) {
  try {
    window.localStorage.setItem(SAVED_LOCATION_KEY, JSON.stringify(location));
  } catch {
    // ignore storage failures
  }
}

export function saveMapCenter(center: MapCenter) {
  try {
    window.sessionStorage.setItem(MAP_STATE_KEY, JSON.stringify(center));
  } catch {
    // ignore storage failures
  }
}

export function getGeolocation(): Promise<BrowserLocation> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error("geolocation not supported"));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracyM: Number.isFinite(position.coords.accuracy) ? position.coords.accuracy : undefined,
        }),
      (error) => reject(error),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 }
    );
  });
}

export function buildPlaceInfoContent(place: Place) {
  return `<div style="padding:10px 12px;font-size:12px;line-height:1.4;">
    <div style="font-weight:700;margin-bottom:4px;">${place.name}</div>
    <div style="color:#666;">${place.category}</div>
    <div style="color:#888;margin-top:4px;">리뷰 ${place.reviewCount ?? 0} · 찜 ${place.likeCount ?? 0}</div>
  </div>`;
}

function mapKakaoResultToPlace(result: KakaoPlaceResult, likedIds: Set<string>): Place {
  return {
    id: String(result.id),
    name: result.place_name,
    category: result.category_name?.split(">").pop()?.trim() || result.category_name || "",
    address: result.address_name || "",
    roadAddress: result.road_address_name || "",
    phone: result.phone || "",
    lat: Number(result.y),
    lng: Number(result.x),
    distanceM: result.distance ? Number(result.distance) : undefined,
    liked: likedIds.has(String(result.id)),
  };
}

export async function searchPlacesInCurrentBounds(
  placesService: KakaoPlaces,
  map: KakaoMap,
  keyword: string,
  likedIds: Set<string>
) {
  const kakao = window.kakao;
  const bounds = map.getBounds();
  const southWest = bounds.getSouthWest();
  const northEast = bounds.getNorthEast();

  return new Promise<Place[]>((resolve) => {
    placesService.keywordSearch(
      keyword,
      (data, status) => {
        if (status !== kakao.maps.services.Status.OK || !Array.isArray(data)) {
          resolve([]);
          return;
        }

        const places = data
          .filter((item) => {
            const lat = Number(item.y);
            const lng = Number(item.x);
            return (
              lat >= southWest.getLat() &&
              lat <= northEast.getLat() &&
              lng >= southWest.getLng() &&
              lng <= northEast.getLng()
            );
          })
          .map((item) => mapKakaoResultToPlace(item, likedIds));

        resolve(places);
      },
      { bounds, size: 15 }
    );
  });
}
