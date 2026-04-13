// src/api/recentPlace.api.ts

import { api } from "../api";

/**
 * 최근 본 식당 저장 요청 DTO
 */
export interface SaveRecentPlaceRequest {
  placeId: string;
}

/**
 * 최근 본 식당 저장 API
 */
export const saveRecentPlaceApi = (data: SaveRecentPlaceRequest) => {
  return api.post("/api/recent-places", data);
};