/*
  file: usePlaceQueries.ts
  description
  - 식당 상세, 리뷰, 리뷰 요약 조회를 React Query 기반으로 제공하는 도메인 훅 모음
*/
import { useQuery } from "@tanstack/react-query";
import { getPlaceDetail } from "../../../api/place/place.api";
import { getPlaceReviews, getPlaceReviewSummary } from "../../../api/place/placeReview.api";
import type { Place } from "../../../types/place/place.types";
import { placeQueryKeys } from "./placeQueryKeys";

export function usePlaceDetailQuery(placeId?: string, initialPlace?: Place | null) {
  return useQuery({
    queryKey: placeQueryKeys.detail(placeId),
    queryFn: () => getPlaceDetail(placeId!),
    enabled: !!placeId,
    initialData: initialPlace ?? undefined,
  });
}

export function usePlaceReviewsQuery(placeId?: string) {
  return useQuery({
    queryKey: placeQueryKeys.reviews(placeId),
    queryFn: async () => {
      const response = await getPlaceReviews(placeId!);
      return response.data;
    },
    enabled: !!placeId,
  });
}

export function usePlaceReviewSummaryQuery(placeId?: string) {
  return useQuery({
    queryKey: placeQueryKeys.reviewSummary(placeId),
    queryFn: async () => {
      const response = await getPlaceReviewSummary(placeId!);
      return response.data;
    },
    enabled: !!placeId,
  });
}
