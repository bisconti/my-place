/*
  파일명 placeCollection.types.ts
  기능
  - 저장 리스트 관련 API 요청과 응답 타입을 정의
*/

export interface PlaceCollectionCreateRequest {
  name: string;
}

export interface PlaceCollectionSummary {
  collectionId: number;
  name: string;
  placeCount: number;
  saved: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PlaceCollectionListResponse {
  items: PlaceCollectionSummary[];
}

export interface PlaceCollectionSavePlaceResponse {
  collectionId: number;
  placeId: string;
  saved: boolean;
  savedAt: string;
}

export interface PlaceCollectionItem {
  collectionItemId: number;
  collectionId: number;
  placeId: string;
  placeName: string;
  category?: string;
  address?: string;
  roadAddress?: string;
  thumbnail?: string;
  rating?: number;
  reviewCount?: number;
  savedAt: string;
}

export interface PlaceCollectionDetailResponse {
  collectionId: number;
  name: string;
  placeCount: number;
  createdAt: string;
  updatedAt: string;
  items: PlaceCollectionItem[];
}
