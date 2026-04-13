/*
  파일명: place.api.ts
  기능 
  - 식당 상세 조회
*/
import { api } from "../api";
import type { Place } from "../../types/place/place.types";

export const getPlaceDetail = async (placeId: string): Promise<Place> => {
  const response = await api.get(`/api/places/${placeId}`);
  return response.data;
};
