/*
  file: useKakaoPlaceMap.ts
  description
  - 카카오 지도 인스턴스, 선택 상태, 마커 렌더링을 조합하는 메인 지도 훅
*/
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { usePlaceLikeState } from "./usePlaceLikeState";
import { useKakaoPlaceData } from "./useKakaoPlaceData";
import { applyPlaceListFiltersAndSort } from "../utils/placeList";
import {
  buildPlaceInfoContent,
  DEFAULT_CENTER,
  getGeolocation,
  readSavedMapCenter,
  saveMapCenter,
  type MapCenter,
} from "../utils/kakaoPlaceMap";
import type { KakaoInfoWindow, KakaoMap, KakaoMarker, KakaoPlaces } from "../types/kakaoMap.types";
import type { Place, PlaceListFilterState, PlaceSortOption } from "../types/place/place.types";

const DEFAULT_FILTERS: PlaceListFilterState = {
  featuredLiveInfoTv: false,
  featuredLifeMaster: false,
  featuredBaekbanTrip: false,
};

type UseKakaoPlaceMapReturn = {
  mapRef: RefObject<HTMLDivElement | null>;
  places: Place[];
  loading: boolean;
  selectedId: string | null;
  setSelectedId: (id: string | null) => void;
  needRefetch: boolean;
  refetchHere: () => Promise<void>;
  goMyLocation: () => void;
  search: (keyword: string) => Promise<void>;
  toggleLike: (id: string) => Promise<void>;
  focusPlaceById: (id: string) => void;
  sortBy: PlaceSortOption;
  setSortBy: (value: PlaceSortOption) => void;
  filters: PlaceListFilterState;
  setFilters: (value: PlaceListFilterState) => void;
};

export function useKakaoPlaceMap(): UseKakaoPlaceMapReturn {
  const restoredCenterRef = useRef<MapCenter | null>(typeof window !== "undefined" ? readSavedMapCenter() : null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const programMoveRef = useRef(false);
  const kakaoMapRef = useRef<KakaoMap | null>(null);
  const placesServiceRef = useRef<KakaoPlaces | null>(null);
  const markersRef = useRef<Map<string, KakaoMarker>>(new Map());
  const infoRef = useRef<KakaoInfoWindow | null>(null);

  const [userPos, setUserPos] = useState(restoredCenterRef.current ?? DEFAULT_CENTER);
  const [center, setCenter] = useState(restoredCenterRef.current ?? DEFAULT_CENTER);
  const [keyword, setKeyword] = useState("");
  const [basePlaces, setBasePlaces] = useState<Place[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needRefetch, setNeedRefetch] = useState(false);
  const [sortBy, setSortBy] = useState<PlaceSortOption>("distance");
  const [filters, setFilters] = useState<PlaceListFilterState>(DEFAULT_FILTERS);

  const { likedIds, toggleLikeById } = usePlaceLikeState({
    places: basePlaces,
    setPlaces: setBasePlaces,
  });

  const places = useMemo(
    () => applyPlaceListFiltersAndSort([...basePlaces], sortBy, filters),
    [basePlaces, sortBy, filters]
  );

  useEffect(() => {
    setSelectedId((prev) => (prev && places.some((place) => place.id === prev) ? prev : null));
  }, [places]);

  const openInfo = useCallback((place: Place) => {
    const infoWindow = infoRef.current;
    const map = kakaoMapRef.current;
    const marker = markersRef.current.get(place.id);
    if (!infoWindow || !map || !marker) return;

    infoWindow.setContent(buildPlaceInfoContent(place));
    infoWindow.open(map, marker);
  }, []);

  const renderMarkers = useCallback(
    (items: Place[]) => {
      const kakao = window.kakao;
      const map = kakaoMapRef.current;

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
            setSelectedId(place.id);
            openInfo(place);
          });

          markersRef.current.set(place.id, marker);
          return;
        }

        existingMarker.setPosition(position);
      });
    },
    [openInfo]
  );

  useEffect(() => {
    renderMarkers(places);
  }, [places, renderMarkers]);

  const fetchPlaces = useKakaoPlaceData({
    keyword,
    likedIds,
    renderMarkers,
    setBasePlaces,
    setLoading,
  });

  const focusPlaceById = useCallback((id: string) => {
    setSelectedId(id);
  }, []);

  const search = useCallback(
    async (value: string) => {
      const trimmedKeyword = value.trim();
      setKeyword(trimmedKeyword);
      await fetchPlaces(kakaoMapRef.current, placesServiceRef.current, trimmedKeyword);
      setNeedRefetch(false);
    },
    [fetchPlaces]
  );

  const refetchHere = useCallback(async () => {
    await fetchPlaces(kakaoMapRef.current, placesServiceRef.current);
    setNeedRefetch(false);
  }, [fetchPlaces]);

  const goMyLocation = useCallback(() => {
    const kakao = window.kakao;
    const map = kakaoMapRef.current;
    if (!map) return;

    programMoveRef.current = true;
    setCenter(userPos);
    saveMapCenter(userPos);
    map.panTo(new kakao.maps.LatLng(userPos.lat, userPos.lng));

    window.setTimeout(() => {
      programMoveRef.current = false;
    }, 300);
  }, [userPos]);

  useEffect(() => {
    if (!window.kakao?.maps) return;

    window.kakao.maps.load(() => {
      const kakao = window.kakao;

      if (!kakao.maps.services) {
        console.error("Kakao services library not loaded. Add libraries=services in SDK url.");
        return;
      }

      const map = new kakao.maps.Map(mapRef.current, {
        center: new kakao.maps.LatLng(center.lat, center.lng),
        level: 4,
      });

      kakaoMapRef.current = map;
      placesServiceRef.current = new kakao.maps.services.Places(map);
      infoRef.current = new kakao.maps.InfoWindow({ zIndex: 3 });

      map.relayout();
      requestAnimationFrame(() => {
        map.relayout();
        map.setCenter(new kakao.maps.LatLng(center.lat, center.lng));
      });

      const syncCenterFromMap = () => {
        const current = map.getCenter();
        const nextCenter = { lat: current.getLat(), lng: current.getLng() };
        setCenter(nextCenter);
        saveMapCenter(nextCenter);
        setNeedRefetch(true);
      };

      kakao.maps.event.addListener(map, "dragend", () => {
        if (programMoveRef.current) return;
        syncCenterFromMap();
      });

      kakao.maps.event.addListener(map, "zoom_changed", () => {
        if (programMoveRef.current) return;
        syncCenterFromMap();
      });

      (async () => {
        const restoredCenter = restoredCenterRef.current;

        try {
          const position = await getGeolocation();
          setUserPos(position);

          if (!restoredCenter) {
            setCenter(position);
            saveMapCenter(position);
            map.setCenter(new kakao.maps.LatLng(position.lat, position.lng));
          }
        } catch {
          // ignore geolocation failure and keep current center
        } finally {
          await fetchPlaces(map, placesServiceRef.current);
          setNeedRefetch(false);
        }
      })();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const map = kakaoMapRef.current;
    if (!map) return;

    requestAnimationFrame(() => map.relayout());
  }, [places.length]);

  useEffect(() => {
    if (!selectedId) return;

    const selectedPlace = places.find((item) => item.id === selectedId);
    if (!selectedPlace) return;

    const kakao = window.kakao;
    const map = kakaoMapRef.current;
    if (!map) return;

    programMoveRef.current = true;
    setCenter({ lat: selectedPlace.lat, lng: selectedPlace.lng });
    saveMapCenter({ lat: selectedPlace.lat, lng: selectedPlace.lng });
    map.panTo(new kakao.maps.LatLng(selectedPlace.lat, selectedPlace.lng));
    openInfo(selectedPlace);

    window.setTimeout(() => {
      programMoveRef.current = false;
    }, 300);
  }, [selectedId, places, openInfo]);

  return {
    mapRef,
    places,
    loading,
    selectedId,
    setSelectedId,
    needRefetch,
    refetchHere,
    goMyLocation,
    search,
    toggleLike: toggleLikeById,
    focusPlaceById,
    sortBy,
    setSortBy,
    filters,
    setFilters,
  };
}
