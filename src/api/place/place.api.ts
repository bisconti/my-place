/*
  파일명: place.api.ts
  기능 
  - 식당 상세 조회
*/
import { api } from "../api";
import type { Place, PlaceAutoCompleteItem } from "../../types/place/place.types";

export const getPlaceDetail = async (placeId: string): Promise<Place> => {
  const response = await api.get(`/api/places/${placeId}`);
  return response.data;
};

// 식당 자동완성 위한 식당 데이터 호출 API
export const getPlaceAutoCompleteList = async (keyword: string): Promise<PlaceAutoCompleteItem[]> => {
  const response = await api.get<PlaceAutoCompleteItem[]>("/api/places/autocomplete", {
    params: { keyword },
  });

  return response.data;
};
