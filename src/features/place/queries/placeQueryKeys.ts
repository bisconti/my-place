/*
  file: placeQueryKeys.ts
  description
  - 식당 도메인에서 사용하는 React Query key를 한곳에서 관리하는 파일
*/
export const placeQueryKeys = {
  all: ["places"] as const,
  detail: (placeId?: string) => [...placeQueryKeys.all, "detail", placeId] as const,
  reviews: (placeId?: string) => [...placeQueryKeys.all, "reviews", placeId] as const,
  reviewSummary: (placeId?: string) => [...placeQueryKeys.all, "review-summary", placeId] as const,
  collections: (placeId?: string) => [...placeQueryKeys.all, "collections", placeId] as const,
};
