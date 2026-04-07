/*
  파일명: placeReview.api.ts
  기능 
  - 리뷰 등록 / 조회 / 삭제 API
*/

import type {
  PlaceReviewRequest,
  PlaceReviewResponse,
  PlaceReviewSummaryResponse,
} from "../../types/place/placeReview.types";
import { api } from "../api";

/**
 * 리뷰 등록
 */
export const savePlaceReview = (review: PlaceReviewRequest, images: File[]) => {
  const formData = new FormData();

  formData.append("userEmail", review.userEmail);
  formData.append("placeId", review.placeId);
  formData.append("placeName", review.placeName ?? "");
  formData.append("address", review.address ?? "");
  formData.append("roadAddress", review.roadAddress ?? "");
  formData.append("category", review.category ?? "");
  formData.append("phone", review.phone ?? "");
  formData.append("rating", String(review.rating));
  formData.append("content", review.content);

  images.forEach((image) => formData.append("images", image));

  return api.post<PlaceReviewResponse>("/api/reviews", formData);
};

/**
 * 특정 장소 리뷰 조회
 */
export const getPlaceReviews = (placeId: string) => {
  return api.get<PlaceReviewResponse[]>(`/api/reviews/place/${placeId}`);
};

/**
 * 식당 상세 페이지 별점 & 리뷰수 조회
 */
export const getPlaceReviewSummary = (placeId: string) => {
  return api.get<PlaceReviewSummaryResponse>(`/api/reviews/summary/${placeId}`);
};

/**
 * 특정 사용자 리뷰 조회
 */
export const getMyReviews = async (userEmail: string): Promise<PlaceReviewResponse[]> => {
  const response = await api.get<PlaceReviewResponse[]>("/api/reviews/my", {
    params: { userEmail },
  });
  return response.data;
};

// 마이페이지 리뷰 건수 조회
export const getMyReviewCount = (userEmail: string) => {
  return api.get<number>(`/user/${userEmail}/count`);
};

/**
 * 리뷰 삭제
 */
export const deletePlaceReview = async (reviewId: number): Promise<void> => {
  await api.delete(`/api/reviews/${reviewId}`);
};
