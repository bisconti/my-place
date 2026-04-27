/*
  file: kakaoMap.types.ts
  description
  - 카카오 지도 SDK를 타입 안전하게 다루기 위한 전역 타입 정의 파일
*/
export type KakaoStatus = "OK" | "ZERO_RESULT" | "ERROR";

export type KakaoPlaceResult = {
  id: string;
  place_name: string;
  category_name?: string;
  address_name?: string;
  road_address_name?: string;
  phone?: string;
  x: string;
  y: string;
  distance?: string;
};

export type KakaoAddressResult = {
  address_name: string;
  x: string;
  y: string;
};

export type KakaoLatLng = {
  getLat(): number;
  getLng(): number;
};

export type KakaoBounds = {
  getSouthWest(): KakaoLatLng;
  getNorthEast(): KakaoLatLng;
};

export type KakaoMap = {
  getBounds(): KakaoBounds;
  getCenter(): KakaoLatLng;
  setCenter(latlng: KakaoLatLng): void;
  panTo(latlng: KakaoLatLng): void;
  relayout(): void;
};

export type KakaoMarker = {
  setMap(map: KakaoMap | null): void;
  setPosition(latlng: KakaoLatLng): void;
};

export type KakaoMarkerImage = unknown;

export type KakaoCircle = {
  setMap(map: KakaoMap | null): void;
  setPosition(latlng: KakaoLatLng): void;
  setRadius(radius: number): void;
};

export type KakaoInfoWindow = {
  setContent(html: string): void;
  open(map: KakaoMap, marker: KakaoMarker): void;
};

export type KakaoPlaces = {
  keywordSearch(
    keyword: string,
    callback: (data: KakaoPlaceResult[], status: KakaoStatus) => void,
    options?: { bounds?: KakaoBounds; size?: number }
  ): void;
};

export type KakaoGeocoder = {
  addressSearch(
    address: string,
    callback: (data: KakaoAddressResult[], status: KakaoStatus) => void
  ): void;
};

export type KakaoNamespace = {
  maps: {
    load(cb: () => void): void;
    LatLng: new (lat: number, lng: number) => KakaoLatLng;
    Map: new (container: HTMLElement | null, options: { center: KakaoLatLng; level: number }) => KakaoMap;
    Marker: new (options: { position: KakaoLatLng; image?: KakaoMarkerImage; title?: string; zIndex?: number }) => KakaoMarker;
    MarkerImage: new (
      src: string,
      size: unknown,
      options?: { offset?: unknown }
    ) => KakaoMarkerImage;
    Size: new (width: number, height: number) => unknown;
    Point: new (x: number, y: number) => unknown;
    Circle: new (options: {
      center: KakaoLatLng;
      radius: number;
      strokeWeight?: number;
      strokeColor?: string;
      strokeOpacity?: number;
      fillColor?: string;
      fillOpacity?: number;
      zIndex?: number;
    }) => KakaoCircle;
    InfoWindow: new (options?: { zIndex?: number }) => KakaoInfoWindow;
    event: {
      addListener(target: unknown, eventName: string, handler: () => void): void;
    };
    services: {
      Status: Record<KakaoStatus, KakaoStatus>;
      Places: new (map?: KakaoMap) => KakaoPlaces;
      Geocoder: new () => KakaoGeocoder;
    };
  };
};

declare global {
  interface Window {
    kakao: KakaoNamespace;
  }
}
