/*
  file: place.types.ts
  description
  - 식당 도메인의 핵심 타입을 정의하는 파일
*/
export interface PlaceImage {
  id: number;
  placeId: string;
  originalFileName?: string;
  storedFileName: string;
  filePath: string;
  fileSize?: number;
  sortOrder: number;
}

export interface Place {
  id: string;
  name: string;
  category: string;
  address: string;
  roadAddress: string;
  phone: string;
  lat: number;
  lng: number;
  distanceM?: number;
  rating?: number;
  reviewCount?: number;
  liked?: boolean;

  images?: PlaceImage[];
}

export interface RecentPlace {
  id: string;
  name: string;
  thumbnail?: string;
  rating?: number;
  reviewCount?: number;
  viewedAt: string;
}

// header 영역 식당 자동검색 type
export interface PlaceAutoCompleteItem {
  placeId: string;
  placeName: string;
  category: string;
  roadAddress: string;
}
