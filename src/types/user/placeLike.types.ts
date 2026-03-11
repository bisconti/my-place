/*
  파일명: placeLike.types.ts
  기능
  - 장소 좋아요(찜) 기능 관련 API 요청(Request) 및 응답(Response) 타입 정의
*/

// 찜 등록/취소 요청 interface
export interface PlaceLikeToggleRequest {
  placeId: string;
  placeName?: string;
  address?: string;
  category?: string;
  liked: boolean;
}

// 찜 등록/취소 서버 응답 interface
export interface PlaceLikeResponse {
  placeId: string;
  liked: boolean;
  createdAt?: string | null;
  placeName?: string;
  address?: string;
  category?: string;
}

//  내 찜 목록 단건 아이템 타입
export interface MyPlaceLikeItem {
  placeId: string;
  liked: boolean;
  createdAt?: string | null;
  placeName?: string;
  address?: string;
  category?: string;
}

//  내 찜 목록 조회 응답 타입
export interface MyPlaceLikeListResponse {
  items: MyPlaceLikeItem[];
}
