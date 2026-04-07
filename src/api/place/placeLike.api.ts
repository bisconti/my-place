/*
  파일명: placesLike.api.ts
  기능 
  - 식당 찜 등록/취소, 찜 목록 조회 API 모음
*/
import { api } from "../api";
import type {
  MyPlaceLikeListResponse,
  PlaceLikeResponse,
  PlaceLikeToggleRequest,
} from "../../types/place/placeLike.types";
import type { Place } from "../../types/place/place.types";

// 찜 등록 / 취소
export const togglePlaceLike = (place: Place, liked: boolean) => {
  return api.post("/api/place-likes/toggle", {
    placeId: place.id,
    placeName: place.name,
    address: place.address,
    roadAddress: place.roadAddress,
    category: place.category,
    phone: place.phone,
    liked,
  });
};

// 내 찜 목록 조회
export const fetchMyLikeIds = () => {
  return api.get<{ items: Array<{ placeId: string }> }>("/api/place-likes/me");
};

// 내 찜 목록 건수 조회
export const getMyPlaceLikeCount = () => {
  return api.get<number>("/api/place-likes/count");
};

// 내 찜 목록 전체 조회
export const getMyPlaceLikes = () => {
  return api.get<MyPlaceLikeListResponse>("/api/place-likes/me");
};

// 찜 등록 / 취소 (payload 직접 전달용)
export const togglePlaceLikeByPayload = (payload: PlaceLikeToggleRequest) => {
  return api.post<PlaceLikeResponse>("/api/place-likes/toggle", payload);
};
