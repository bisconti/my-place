/*
  file: useKakaoPlaceMap.ts
  description
  - Ïπ¥Ïπ¥??ÏßÄ???∏Ïä§?¥Ïä§, ?•ÏÜå ÎßàÏª§, ???ÑÏπò Í∏∞Ï?Í≥?ÎßàÏª§Î•??®Íªò Í¥ÄÎ¶¨Ìïò??Î©îÏù∏ ÏßÄ????*/
import { useCallback, useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { useKakaoCurrentLocationOverlay } from "./useKakaoCurrentLocationOverlay";
import { useKakaoPlaceData } from "./useKakaoPlaceData";
import { useKakaoPlaceMarkers } from "./useKakaoPlaceMarkers";
import { usePlaceLikeState } from "./usePlaceLikeState";
import type { KakaoInfoWindow, KakaoMap, KakaoMarker, KakaoPlaces } from "../types/kakaoMap.types";
import type { Place, PlaceListFilterState, PlaceSortOption } from "../types/place/place.types";
import {
  type BrowserLocation,
  buildPlaceInfoContent,
  DEFAULT_CENTER,
  getGeolocation,
  type LocationSource,
  type MapCenter,
  readLocationSource,
  readSavedLocation,
  readSavedMapCenter,
  saveLocationSource,
  saveMapCenter,
  saveSavedLocation,
  type SavedLocation,
} from "../utils/kakaoPlaceMap";
import { applyPlaceListFiltersAndSort } from "../utils/placeList";

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
  goMyLocation: () => Promise<void>;
  locationSource: LocationSource;
  setLocationSource: (source: LocationSource) => void;
  savedLocation: SavedLocation | null;
  saveLocationByAddress: (address: string) => Promise<boolean>;
  saveCurrentCenterAsLocation: () => Promise<boolean>;
  isLocating: boolean;
  search: (keyword: string) => Promise<void>;
  toggleLike: (id: string) => Promise<void>;
  focusPlaceById: (id: string) => void;
  sortBy: PlaceSortOption;
  setSortBy: (value: PlaceSortOption) => void;
  filters: PlaceListFilterState;
  setFilters: (value: PlaceListFilterState) => void;
};

type MoveToCenterOptions = {
  shouldFetch?: boolean;
  currentLocation?: BrowserLocation | SavedLocation;
  source?: LocationSource;
};

export function useKakaoPlaceMap(): UseKakaoPlaceMapReturn {
  const restoredCenterRef = useRef<MapCenter | null>(typeof window !== "undefined" ? readSavedMapCenter() : null);
  const mapRef = useRef<HTMLDivElement | null>(null);
  const programMoveRef = useRef(false);
  const kakaoMapRef = useRef<KakaoMap | null>(null);
  const placesServiceRef = useRef<KakaoPlaces | null>(null);
  const markersRef = useRef<Map<string, KakaoMarker>>(new Map());
  const placeByIdRef = useRef<Map<string, Place>>(new Map());
  const shouldPanToSelectedPlaceRef = useRef(true);
  const infoRef = useRef<KakaoInfoWindow | null>(null);

  const [center, setCenter] = useState(restoredCenterRef.current ?? DEFAULT_CENTER);
  const [locationSource, setLocationSourceState] = useState<LocationSource>(
    typeof window !== "undefined" ? readLocationSource() : "browser"
  );
  const [savedLocation, setSavedLocationState] = useState<SavedLocation | null>(
    typeof window !== "undefined" ? readSavedLocation() : null
  );
  const [keyword, setKeyword] = useState("");
  const [basePlaces, setBasePlaces] = useState<Place[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
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
    placeByIdRef.current = new Map(places.map((place) => [place.id, place]));
  }, [places]);

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

  const { renderMarkers } = useKakaoPlaceMarkers({
    mapRef: kakaoMapRef,
    markersRef,
    placeByIdRef,
    onSelectMarker: (placeId) => {
      shouldPanToSelectedPlaceRef.current = false;
      setSelectedId(placeId);
    },
    openInfo,
  });

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
    shouldPanToSelectedPlaceRef.current = true;
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

  const { renderCurrentLocation } = useKakaoCurrentLocationOverlay(kakaoMapRef);

  const moveToCenter = useCallback(
    async (nextCenter: MapCenter, options: MoveToCenterOptions = {}) => {
      const kakao = window.kakao;
      const map = kakaoMapRef.current;
      if (!map) return;

      programMoveRef.current = true;
      setCenter(nextCenter);
      saveMapCenter(nextCenter);
      map.setCenter(new kakao.maps.LatLng(nextCenter.lat, nextCenter.lng));

      if (options.currentLocation && options.source) {
        renderCurrentLocation(options.currentLocation, options.source);
      }

      if (options.shouldFetch) {
        await fetchPlaces(map, placesServiceRef.current);
        setNeedRefetch(false);
      }

      window.setTimeout(() => {
        programMoveRef.current = false;
      }, 300);
    },
    [fetchPlaces, renderCurrentLocation]
  );

  const setLocationSource = useCallback((source: LocationSource) => {
    setLocationSourceState(source);
    saveLocationSource(source);
  }, []);

  const goMyLocation = useCallback(async () => {
    const map = kakaoMapRef.current;
    if (!map) return;

    setIsLocating(true);
    try {
      if (locationSource === "saved") {
        if (!savedLocation) {
          window.alert("?Ä???ÑÏπòÍ∞Ä ?ÜÏäµ?àÎã§. Ï£ºÏÜåÎ•?Î®ºÏ? ?Ä?•Ìï¥Ï£ºÏÑ∏??");
          return;
        }

        await moveToCenter(savedLocation, {
          shouldFetch: true,
          currentLocation: savedLocation,
          source: "saved",
        });
        return;
      }

      const nextPosition = await getGeolocation();
      await moveToCenter(nextPosition, {
        shouldFetch: true,
        currentLocation: nextPosition,
        source: "browser",
      });
    } catch {
      window.alert("?ÑÏû¨ ?ÑÏπòÎ•?Í∞Ä?∏Ïò¨ ???ÜÏäµ?àÎã§. Î∏åÎùº?∞Ï? ?ÑÏπò Í∂åÌïú???ïÏù∏?¥Ï£º?∏Ïöî.");
    } finally {
      setIsLocating(false);
    }
  }, [locationSource, moveToCenter, savedLocation]);

  const findLocationByAddress = useCallback((address: string) => {
    const kakao = window.kakao;

    return new Promise<SavedLocation>((resolve, reject) => {
      if (!kakao?.maps?.services?.Geocoder) {
        reject(new Error("Kakao Geocoder is not available."));
        return;
      }

      const geocoder = new kakao.maps.services.Geocoder();
      geocoder.addressSearch(address, (data, status) => {
        if (status !== kakao.maps.services.Status.OK || !Array.isArray(data) || data.length === 0) {
          reject(new Error("Address not found."));
          return;
        }

        const result = data[0];
        resolve({
          address: result.address_name || address,
          lat: Number(result.y),
          lng: Number(result.x),
        });
      });
    });
  }, []);

  const saveLocationByAddress = useCallback(
    async (address: string) => {
      const trimmedAddress = address.trim();
      if (!trimmedAddress) {
        window.alert("?Ä?•Ìï† Ï£ºÏÜåÎ•??ÖÎ†•?¥Ï£º?∏Ïöî.");
        return false;
      }

      try {
        const nextSavedLocation = await findLocationByAddress(trimmedAddress);
        setSavedLocationState(nextSavedLocation);
        saveSavedLocation(nextSavedLocation);
        setLocationSource("saved");
        await moveToCenter(nextSavedLocation, {
          shouldFetch: true,
          currentLocation: nextSavedLocation,
          source: "saved",
        });
        return true;
      } catch {
        window.alert("Ï£ºÏÜåÎ•?Ï∞æÏùÑ ???ÜÏäµ?àÎã§. ?ÑÎ°úÎ™?Ï£ºÏÜå??ÏßÄÎ≤?Ï£ºÏÜåÎ•??§Ïãú ?ïÏù∏?¥Ï£º?∏Ïöî.");
        return false;
      }
    },
    [findLocationByAddress, moveToCenter, setLocationSource]
  );

  const saveCurrentCenterAsLocation = useCallback(async () => {
    const map = kakaoMapRef.current;
    if (!map) return false;

    const current = map.getCenter();
    const nextSavedLocation = {
      address: `?ÑÏû¨ ÏßÄ??Ï§ëÏã¨ (${current.getLat().toFixed(6)}, ${current.getLng().toFixed(6)})`,
      lat: current.getLat(),
      lng: current.getLng(),
    };

    setSavedLocationState(nextSavedLocation);
    saveSavedLocation(nextSavedLocation);
    setLocationSource("saved");
    renderCurrentLocation(nextSavedLocation, "saved");
    return true;
  }, [renderCurrentLocation, setLocationSource]);

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

        if (locationSource === "saved" && savedLocation) {
          if (!restoredCenter) {
            setCenter(savedLocation);
            saveMapCenter(savedLocation);
            map.setCenter(new kakao.maps.LatLng(savedLocation.lat, savedLocation.lng));
          }

          renderCurrentLocation(savedLocation, "saved");
          await fetchPlaces(map, placesServiceRef.current);
          setNeedRefetch(false);
          return;
        }

        try {
          const position = await getGeolocation();

          if (!restoredCenter) {
            setCenter(position);
            saveMapCenter(position);
            map.setCenter(new kakao.maps.LatLng(position.lat, position.lng));
          }

          renderCurrentLocation(position, "browser");
        } catch {
          // Keep the restored/default center when the browser cannot provide a location.
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
    const marker = markersRef.current.get(selectedPlace.id);
    if (!map) return;

    if (!shouldPanToSelectedPlaceRef.current) {
      shouldPanToSelectedPlaceRef.current = true;
      openInfo(selectedPlace);
      return;
    }

    const nextPosition = marker?.getPosition() ?? new kakao.maps.LatLng(selectedPlace.lat, selectedPlace.lng);
    const nextCenter = { lat: nextPosition.getLat(), lng: nextPosition.getLng() };

    programMoveRef.current = true;
    setCenter(nextCenter);
    saveMapCenter(nextCenter);
    map.panTo(nextPosition);
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
    locationSource,
    setLocationSource,
    savedLocation,
    saveLocationByAddress,
    saveCurrentCenterAsLocation,
    isLocating,
    search,
    toggleLike: toggleLikeById,
    focusPlaceById,
    sortBy,
    setSortBy,
    filters,
    setFilters,
  };
}
