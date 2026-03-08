/*
  파일명: placesLike.api.ts
  기능 
  - 식당 찜 등록/취소, 찜 목록 조회 API 모음
*/
import { api } from "./api";
import type { Place } from "../components/layout/PlaceListPanel";
import type { PlaceLikeResponse, PlaceLikeToggleRequest } from "../types/user/placeLike.types";

// 찜 등록 / 취소
export const togglePlaceLike = (p: Place, nextLiked: boolean) => {
  const payload: PlaceLikeToggleRequest = {
    placeId: p.id,
    placeName: p.name,
    address: p.address,
    category: p.category,
    liked: nextLiked,
  };

  return api.post<PlaceLikeResponse>("/api/place-likes/toggle", payload);
};

// 내 찜 목록 조회
export const fetchMyLikeIds = () => {
  return api.get<{ items: Array<{ placeId: string }> }>("/api/place-likes/me");
};

// 내 찜 목록 건수 조회
export const getMyPlaceLikeCount = () => {
  return api.get<number>("/api/place-likes/count");
};
