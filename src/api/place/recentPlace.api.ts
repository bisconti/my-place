// src/api/recentPlace.api.ts

import { api } from "../api";
import type { RecentPlace } from "../../types/place/place.types";

/**
 * 최근 본 식당 저장 요청 DTO
 */
export interface SaveRecentPlaceRequest {
  placeId: string;
}

type RecentPlaceApiResponse = {
  placeId: string;
  placeName: string;
  thumbnail?: string;
  rating?: number;
  reviewCount?: number;
  viewedAt: string;
};

/**
 * 최근 본 식당 저장 API
 */
export const saveRecentPlaceApi = (data: SaveRecentPlaceRequest) => {
  return api.post("/api/recent-places", data);
};

/**
 * 최근 방문 식당 목록 조회 API
 */
export const getRecentPlacesApi = async (): Promise<RecentPlace[]> => {
  const response = await api.get<RecentPlaceApiResponse[]>("/api/recent-places");

  return response.data.map((item) => ({
    id: item.placeId,
    name: item.placeName,
    thumbnail: item.thumbnail,
    rating: item.rating,
    reviewCount: item.reviewCount,
    viewedAt: item.viewedAt,
  }));
};
