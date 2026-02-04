import { useCallback, useEffect, useRef, useState } from "react";

/** =========================
 * Domain types
 * ========================= */
export type Place = {
  id: string;
  name: string;
  category: string;
  address: string;
  lat: number;
  lng: number;
  distanceM?: number;
  rating?: number;
  reviewCount?: number;
  liked?: boolean;
};

const DEFAULT_CENTER = { lat: 37.5665, lng: 126.978 }; // 서울시청

function getGeolocation(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("geolocation not supported"));
    navigator.geolocation.getCurrentPosition(
      (pos) => resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      (err) => reject(err),
      { enableHighAccuracy: true, timeout: 8000, maximumAge: 60_000 }
    );
  });
}

/** =========================
 * Kakao minimal type defs
 * (필요한 만큼만)
 * ========================= */
type KakaoStatus = "OK" | "ZERO_RESULT" | "ERROR";

type KakaoPlaceResult = {
  id: string;
  place_name: string;
  category_name?: string;
  address_name?: string;
  road_address_name?: string;
  x: string; // lng
  y: string; // lat
  distance?: string;
};

type KakaoLatLng = {
  getLat(): number;
  getLng(): number;
};

type KakaoBounds = {
  getSouthWest(): KakaoLatLng;
  getNorthEast(): KakaoLatLng;
};

type KakaoMap = {
  getBounds(): KakaoBounds;
  setCenter(latlng: KakaoLatLng): void;
  panTo(latlng: KakaoLatLng): void;
  relayout(): void;
};

type KakaoMarker = {
  setMap(map: KakaoMap | null): void;
  setPosition(latlng: KakaoLatLng): void;
};

type KakaoInfoWindow = {
  setContent(html: string): void;
  open(map: KakaoMap, marker: KakaoMarker): void;
};

type KakaoPlaces = {
  keywordSearch(
    keyword: string,
    callback: (data: KakaoPlaceResult[], status: KakaoStatus) => void,
    options?: { bounds?: KakaoBounds; size?: number }
  ): void;
};

type KakaoNamespace = {
  maps: {
    load(cb: () => void): void;
    LatLng: new (lat: number, lng: number) => KakaoLatLng;
    Map: new (container: HTMLElement | null, options: { center: KakaoLatLng; level: number }) => KakaoMap;
    Marker: new (options: { position: KakaoLatLng }) => KakaoMarker;
    InfoWindow: new (options?: { zIndex?: number }) => KakaoInfoWindow;
    event: {
      addListener(target: unknown, eventName: string, handler: () => void): void;
    };
    services: {
      Status: Record<KakaoStatus, KakaoStatus>;
      Places: new (map?: KakaoMap) => KakaoPlaces;
    };
  };
};

declare global {
  interface Window {
    kakao: KakaoNamespace;
  }
}

type UseKakaoPlaceMapReturn = {
  mapRef: React.RefObject<HTMLDivElement | null>;

  places: Place[];
  loading: boolean;

  selectedId: string | null;
  setSelectedId: (id: string | null) => void;

  needRefetch: boolean;
  refetchHere: () => Promise<void>;

  goMyLocation: () => void;
  search: (keyword: string) => Promise<void>;

  toggleLike: (id: string) => void;
};

export function useKakaoPlaceMap(): UseKakaoPlaceMapReturn {
  const mapRef = useRef<HTMLDivElement | null>(null);
  const programMoveRef = useRef(false);

  const kakaoMapRef = useRef<KakaoMap | null>(null);
  const placesServiceRef = useRef<KakaoPlaces | null>(null);
  const markersRef = useRef<Map<string, KakaoMarker>>(new Map());
  const infoRef = useRef<KakaoInfoWindow | null>(null);

  const [userPos, setUserPos] = useState(DEFAULT_CENTER);
  const [center, setCenter] = useState(DEFAULT_CENTER);

  const [keyword, setKeyword] = useState("");
  const [places, setPlaces] = useState<Place[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [needRefetch, setNeedRefetch] = useState(false);

  /** 마커/인포윈도우 */
  const openInfo = useCallback((p: Place) => {
    const iw = infoRef.current;
    const map = kakaoMapRef.current;
    const marker = markersRef.current.get(p.id);
    if (!iw || !map || !marker) return;

    iw.setContent(
      `<div style="padding:10px 12px;font-size:12px;line-height:1.3;">
        <div style="font-weight:700;margin-bottom:4px;">${p.name}</div>
        <div style="color:#666;">${p.category}</div>
        <div style="color:#888;margin-top:4px;">${p.address}</div>
      </div>`
    );
    iw.open(map, marker);
  }, []);

  const renderMarkers = useCallback(
    (items: Place[]) => {
      const kakao = window.kakao;
      const map = kakaoMapRef.current;

      // 기존 마커 중 없는 것 제거
      const nextIds = new Set(items.map((p) => p.id));
      for (const [id, marker] of markersRef.current.entries()) {
        if (!nextIds.has(id)) {
          marker.setMap(null);
          markersRef.current.delete(id);
        }
      }

      // 마커 생성/업데이트
      items.forEach((p) => {
        const existing = markersRef.current.get(p.id);
        const pos = new kakao.maps.LatLng(p.lat, p.lng);

        if (!existing) {
          const marker = new kakao.maps.Marker({ position: pos });
          if (map) marker.setMap(map);

          kakao.maps.event.addListener(marker, "click", () => {
            setSelectedId(p.id);
            openInfo(p);
          });

          markersRef.current.set(p.id, marker);
        } else {
          existing.setPosition(pos);
        }
      });
    },
    [openInfo]
  );

  /** Places 검색 (bounds 기준) */
  const fetchPlaces = useCallback(
    async (overrideKeyword?: string) => {
      const kakao = window.kakao;
      const map = kakaoMapRef.current;
      const ps = placesServiceRef.current;
      if (!map || !ps) return;

      const q = (overrideKeyword ?? keyword).trim() || "맛집";
      setLoading(true);

      return new Promise<void>((resolve) => {
        const bounds = map.getBounds();
        const sw = bounds.getSouthWest();
        const ne = bounds.getNorthEast();

        ps.keywordSearch(
          q,
          (data, status) => {
            setLoading(false);

            if (status !== kakao.maps.services.Status.OK || !Array.isArray(data)) {
              setPlaces([]);
              renderMarkers([]);
              resolve();
              return;
            }

            const items: Place[] = data
              .filter((d) => {
                const lat = Number(d.y);
                const lng = Number(d.x);
                return lat >= sw.getLat() && lat <= ne.getLat() && lng >= sw.getLng() && lng <= ne.getLng();
              })
              .map((d) => ({
                id: String(d.id),
                name: d.place_name,
                category: d.category_name?.split(">").pop()?.trim() || d.category_name || "",
                address: d.road_address_name || d.address_name || "",
                lat: Number(d.y),
                lng: Number(d.x),
                distanceM: d.distance ? Number(d.distance) : undefined,
                liked: false,
              }));

            setPlaces(items);
            renderMarkers(items);

            setSelectedId((prev) => (prev && items.some((x) => x.id === prev) ? prev : null));
            resolve();
          },
          { bounds, size: 15 }
        );
      });
    },
    [keyword, renderMarkers]
  );

  /** public actions */
  const toggleLike = useCallback((id: string) => {
    setPlaces((prev) => prev.map((p) => (p.id === id ? { ...p, liked: !p.liked } : p)));
  }, []);

  const search = useCallback(
    async (kw: string) => {
      const trimmed = kw.trim();
      setKeyword(trimmed);
      await fetchPlaces(trimmed);
      setNeedRefetch(false);
    },
    [fetchPlaces]
  );

  const refetchHere = useCallback(async () => {
    await fetchPlaces();
    setNeedRefetch(false);
  }, [fetchPlaces]);

  const goMyLocation = useCallback(() => {
    const kakao = window.kakao;
    const map = kakaoMapRef.current;
    if (!map) return;

    programMoveRef.current = true;
    map.panTo(new kakao.maps.LatLng(userPos.lat, userPos.lng));

    window.setTimeout(() => {
      programMoveRef.current = false;
    }, 300);
  }, [userPos.lat, userPos.lng]);

  /** map init */
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

      // relayout 안정화
      map.relayout();
      requestAnimationFrame(() => {
        map.relayout();
        map.setCenter(new kakao.maps.LatLng(center.lat, center.lng));
      });

      // 사용자 조작일 때만 재검색 버튼 노출
      kakao.maps.event.addListener(map, "dragend", () => {
        if (programMoveRef.current) return;
        setNeedRefetch(true);
      });
      kakao.maps.event.addListener(map, "zoom_changed", () => {
        if (programMoveRef.current) return;
        setNeedRefetch(true);
      });

      (async () => {
        try {
          const pos = await getGeolocation();
          setUserPos(pos);
          setCenter(pos);
          map.setCenter(new kakao.maps.LatLng(pos.lat, pos.lng));

          await fetchPlaces();
          setNeedRefetch(false);
        } catch {
          await fetchPlaces();
          setNeedRefetch(false);
        }
      })();
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** places 변경 시 relayout (리스트/지도 레이아웃 변화 대응) */
  useEffect(() => {
    const map = kakaoMapRef.current;
    if (!map) return;
    requestAnimationFrame(() => map.relayout());
  }, [places.length]);

  /** selectedId 변경 시 지도 이동 + 인포 */
  useEffect(() => {
    if (!selectedId) return;
    const p = places.find((x) => x.id === selectedId);
    if (!p) return;

    const kakao = window.kakao;
    const map = kakaoMapRef.current;
    if (!map) return;

    programMoveRef.current = true;
    map.panTo(new kakao.maps.LatLng(p.lat, p.lng));
    openInfo(p);

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

    toggleLike,
  };
}
