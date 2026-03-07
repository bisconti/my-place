import { api } from "./api";
import type { Place } from "../components/layout/PlaceListPanel";

export type PlaceLikeToggleRequest = {
  placeId: string;
  placeName?: string;
  address?: string;
  category?: string;
  liked: boolean;
};

export type PlaceLikeResponse = {
  placeId: string;
  liked: boolean;
  createdAt?: string | null;
  placeName?: string;
  address?: string;
  category?: string;
};

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
