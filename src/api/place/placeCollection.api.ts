/*
  파일명 placeCollection.api.ts
  기능
  - 저장 리스트 생성, 조회, 식당 저장 및 제거 관련 API를 관리
*/
import { api } from "../api";
import type { Place } from "../../types/place/place.types";
import type {
  PlaceCollectionCreateRequest,
  PlaceCollectionDetailResponse,
  PlaceCollectionListResponse,
  PlaceCollectionSavePlaceResponse,
} from "../../types/place/placeCollection.types";

export const getMyPlaceCollections = (placeId?: string) => {
  return api.get<PlaceCollectionListResponse>("/api/place-collections/me", {
    params: placeId ? { placeId } : undefined,
  });
};

export const createPlaceCollection = (payload: PlaceCollectionCreateRequest) => {
  return api.post("/api/place-collections", payload);
};

export const savePlaceToCollection = (collectionId: number, place: Place) => {
  return api.post<PlaceCollectionSavePlaceResponse>(`/api/place-collections/${collectionId}/places`, {
    placeId: place.id,
    placeName: place.name,
    address: place.address,
    roadAddress: place.roadAddress,
    category: place.category,
    phone: place.phone,
  });
};

export const getPlaceCollectionDetail = (collectionId: number) => {
  return api.get<PlaceCollectionDetailResponse>(`/api/place-collections/${collectionId}`);
};

export const removePlaceFromCollection = (collectionId: number, placeId: string) => {
  return api.delete(`/api/place-collections/${collectionId}/places/${placeId}`);
};

export const deletePlaceCollection = (collectionId: number) => {
  return api.delete(`/api/place-collections/${collectionId}`);
};
