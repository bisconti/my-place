/*
  file: placeVisitHistory.types.ts
  description
  - 식당 방문 기록 관련 타입을 정의하는 파일
*/
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
