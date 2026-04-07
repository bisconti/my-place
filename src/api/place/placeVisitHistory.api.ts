import type {
  PlaceVisitedResponse,
  PlaceVisitHistoryCreateRequest,
  PlaceVisitHistoryResponse,
} from "../../types/place/placeVisitHistory.types";
import { api } from "../api";

export const createPlaceVisitHistory = async (payload: PlaceVisitHistoryCreateRequest): Promise<void> => {
  await api.post("/api/place-visit-histories", payload);
};

export const getPlaceVisited = async (placeId: string): Promise<PlaceVisitedResponse> => {
  const response = await api.get("/api/place-visit-histories/visited", {
    params: { placeId },
  });
  return response.data;
};

export const getMyPlaceVisitHistories = async (): Promise<PlaceVisitHistoryResponse[]> => {
  const response = await api.get("/api/place-visit-histories");
  return response.data;
};
