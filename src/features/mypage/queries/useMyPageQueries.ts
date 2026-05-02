/*
  file: useMyPageQueries.ts
  description
  - 마이페이지 통계, 최근 방문, 찜 목록 조회를 React Query 기반으로 제공하는 훅 모음
*/
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  createPlaceCollection,
  deletePlaceCollection,
  getMyPlaceCollections,
  getPlaceCollectionDetail,
  removePlaceFromCollection,
} from "../../../api/place/placeCollection.api";
import { getMyPlaceLikeCount, getMyPlaceLikes, togglePlaceLikeByPayload } from "../../../api/place/placeLike.api";
import { getRecentPlacesApi } from "../../../api/place/recentPlace.api";
import { deletePlaceReview, getMyReviewCount, getMyReviews, updatePlaceReview } from "../../../api/place/placeReview.api";
import type { PlaceCollectionCreateRequest } from "../../../types/place/placeCollection.types";
import type { PlaceLikeResponse } from "../../../types/place/placeLike.types";
import type { PlaceReviewUpdateRequest } from "../../../types/place/placeReview.types";
import { myPageQueryKeys } from "./myPageQueryKeys";

export function useMyPageStatsQuery(userEmail?: string) {
  return useQuery({
    queryKey: myPageQueryKeys.stats(userEmail),
    enabled: !!userEmail,
    queryFn: async () => {
      const [likeResult, reviewResult, recentPlaces] = await Promise.all([
        getMyPlaceLikeCount(),
        getMyReviewCount(),
        getRecentPlacesApi(),
      ]);

      return {
        likeCount: likeResult.data,
        reviewCount: reviewResult.data,
        recentPlaceCount: recentPlaces.length,
      };
    },
  });
}

export function useRecentPlacesQuery() {
  return useQuery({
    queryKey: myPageQueryKeys.recentPlaces(),
    queryFn: getRecentPlacesApi,
  });
}

export function useFavoritePlacesQuery() {
  return useQuery({
    queryKey: myPageQueryKeys.favoritePlaces(),
    queryFn: async () => {
      const response = await getMyPlaceLikes();
      return response.data.items ?? [];
    },
  });
}

export function usePlaceCollectionsQuery() {
  return useQuery({
    queryKey: myPageQueryKeys.collections(),
    queryFn: async () => {
      const response = await getMyPlaceCollections();
      return response.data.items ?? [];
    },
  });
}

export function usePlaceCollectionDetailQuery(collectionId?: number) {
  return useQuery({
    queryKey: myPageQueryKeys.collectionDetail(collectionId),
    enabled: Number.isFinite(collectionId),
    queryFn: async () => {
      const response = await getPlaceCollectionDetail(collectionId!);
      return response.data;
    },
  });
}

export function useCreatePlaceCollectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: PlaceCollectionCreateRequest) => createPlaceCollection(payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: myPageQueryKeys.collections() });
    },
  });
}

export function useRemovePlaceFromCollectionMutation(collectionId?: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (placeId: string) => removePlaceFromCollection(collectionId!, placeId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: myPageQueryKeys.collectionDetail(collectionId) });
      await queryClient.invalidateQueries({ queryKey: myPageQueryKeys.collections() });
    },
  });
}

export function useDeletePlaceCollectionMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (collectionId: number) => deletePlaceCollection(collectionId),
    onSuccess: async (_, collectionId) => {
      await queryClient.invalidateQueries({ queryKey: myPageQueryKeys.collections() });
      queryClient.removeQueries({ queryKey: myPageQueryKeys.collectionDetail(collectionId) });
    },
  });
}

export function useMyReviewsQuery(userEmail?: string) {
  return useQuery({
    queryKey: myPageQueryKeys.myReviews(userEmail),
    enabled: !!userEmail,
    queryFn: getMyReviews,
  });
}

export function useUpdateMyReviewMutation(userEmail?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ reviewId, payload }: { reviewId: number; payload: PlaceReviewUpdateRequest }) =>
      updatePlaceReview(reviewId, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: myPageQueryKeys.myReviews(userEmail) });
      await queryClient.invalidateQueries({ queryKey: myPageQueryKeys.stats(userEmail) });
    },
  });
}

export function useDeleteMyReviewMutation(userEmail?: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (reviewId: number) => deletePlaceReview(reviewId),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: myPageQueryKeys.myReviews(userEmail) });
      await queryClient.invalidateQueries({ queryKey: myPageQueryKeys.stats(userEmail) });
    },
  });
}

export function useDeleteFavoritePlacesMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (places: PlaceLikeResponse[]) => {
      await Promise.all(
        places.map((place) =>
          togglePlaceLikeByPayload({
            placeId: place.placeId,
            placeName: place.placeName,
            address: place.address,
            category: place.category,
            liked: false,
          })
        )
      );
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: myPageQueryKeys.favoritePlaces() });
      await queryClient.invalidateQueries({ queryKey: myPageQueryKeys.all });
    },
  });
}
