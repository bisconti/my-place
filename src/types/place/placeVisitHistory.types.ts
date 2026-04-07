export interface PlaceVisitHistoryCreateRequest {
  placeId: string;
  visitDate?: string;
}

export interface PlaceVisitedResponse {
  visited: boolean;
}

export interface PlaceVisitHistoryResponse {
  id: number;
  userEmail: string;
  placeId: string;
  visitDate: string;
  visitSource: string;
  createdAt: string;
  updatedAt: string;
}
