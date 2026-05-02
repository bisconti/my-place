import type {
  PlaceReviewRequest,
  PlaceReviewResponse,
  PlaceReviewSummaryResponse,
  PlaceReviewUpdateRequest,
} from "../../types/place/placeReview.types";
import { api } from "../api";

export const savePlaceReview = (review: PlaceReviewRequest, images: File[]) => {
  const formData = new FormData();

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

export const updatePlaceReview = async (reviewId: number, payload: PlaceReviewUpdateRequest) => {
  const response = await api.put<PlaceReviewResponse>(`/api/reviews/${reviewId}`, payload);
  return response.data;
};

export const getPlaceReviews = (placeId: string) => {
  return api.get<PlaceReviewResponse[]>(`/api/reviews/place/${placeId}`);
};

export const getPlaceReviewSummary = (placeId: string) => {
  return api.get<PlaceReviewSummaryResponse>(`/api/reviews/summary/${placeId}`);
};

export const getMyReviews = async (): Promise<PlaceReviewResponse[]> => {
  const response = await api.get<PlaceReviewResponse[]>("/api/reviews/my");
  return response.data;
};

export const getMyReviewCount = () => {
  return api.get<number>("/user/me/review-count");
};

export const deletePlaceReview = async (reviewId: number): Promise<void> => {
  await api.delete(`/api/reviews/${reviewId}`);
};
