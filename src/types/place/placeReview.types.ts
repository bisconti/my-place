/*
  파일명: placesReview.types.ts
  기능 
  - 식당 리뷰 등록 type
*/
export interface PlaceReviewRequest {
  placeId: string;
  placeName?: string;
  address?: string;
  roadAddress?: string;
  category?: string;
  phone?: string;
  rating: number;
  content: string;
}

export interface PlaceReviewUpdateRequest {
  rating: number;
  content: string;
}

export interface PlaceReviewImageResponse {
  id: number;
  originalFileName: string;
  storedFileName: string;
  filePath: string;
  fileSize: number;
  sortOrder: number;
}

export interface PlaceReviewResponse {
  id: number;
  userEmail: string;
  nickname: string;
  placeId: string;
  placeName: string;
  rating: number;
  content: string;
  createdAt: string;
  updatedAt: string;
  images: PlaceReviewImageResponse[];
}

// 식당 상세 페이지 별점&리뷰수 조회 응답 타입
export interface PlaceReviewSummaryResponse {
  placeId: string;
  averageRating: number;
  reviewCount: number;
}

/*
  기능
  - 내 리뷰 목록 조회용 type
*/
export interface MyPlaceReviewListResponse {
  reviews: PlaceReviewResponse[];
  totalCount: number;
}
