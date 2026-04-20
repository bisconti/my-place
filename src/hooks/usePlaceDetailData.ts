/*
  file: usePlaceDetailData.ts
  description
  - 식당 상세 페이지에서 React Query 기반 조회와 모달 UI 상태를 함께 관리하는 훅
*/
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { getMyPlaceCollections } from "../api/place/placeCollection.api";
import { saveRecentPlaceApi } from "../api/place/recentPlace.api";
import { usePlaceDetailQuery, usePlaceReviewsQuery, usePlaceReviewSummaryQuery } from "../features/place/queries/usePlaceQueries";
import { useAuthStore } from "../stores/authStore";
import type { PlaceCollectionSummary } from "../types/place/placeCollection.types";
import type { Place } from "../types/place/place.types";

type ViewerImage = {
  src: string;
  alt: string;
};

export function usePlaceDetailData(placeId?: string, initialPlace?: Place | null) {
  const token = useAuthStore((state) => state.token);

  const placeQuery = usePlaceDetailQuery(placeId, initialPlace);
  const reviewSummaryQuery = usePlaceReviewSummaryQuery(placeId);
  const reviewsQuery = usePlaceReviewsQuery(placeId);

  const [viewerImage, setViewerImage] = useState<ViewerImage | null>(null);
  const [collections, setCollections] = useState<PlaceCollectionSummary[]>([]);
  const [isCollectionLoading, setIsCollectionLoading] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  const recentPlaceSavedRef = useRef(false);

  useEffect(() => {
    if (!token || !placeQuery.data?.id || recentPlaceSavedRef.current) return;

    recentPlaceSavedRef.current = true;
    saveRecentPlaceApi({ placeId: placeQuery.data.id }).catch(() => {
      console.warn("최근 방문 식당 저장 실패");
    });
  }, [placeQuery.data?.id, token]);

  useEffect(() => {
    if (!viewerImage) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setViewerImage(null);
      }
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [viewerImage]);

  const fetchCollections = useCallback(async () => {
    if (!placeQuery.data?.id) return;

    try {
      setIsCollectionLoading(true);
      const response = await getMyPlaceCollections(placeQuery.data.id);
      setCollections(response.data.items ?? []);
    } catch (error) {
      console.error("저장 리스트 조회 실패", error);
      toast.error("저장 리스트를 불러오지 못했습니다.");
    } finally {
      setIsCollectionLoading(false);
    }
  }, [placeQuery.data?.id]);

  const openSaveModal = useCallback(async () => {
    setIsSaveModalOpen(true);
    await fetchCollections();
  }, [fetchCollections]);

  return {
    token,
    place: placeQuery.data ?? null,
    isPlaceLoading: placeQuery.isLoading,
    reviewSummary: reviewSummaryQuery.data ?? null,
    reviews: reviewsQuery.data ?? [],
    isReviewLoading: reviewSummaryQuery.isLoading || reviewsQuery.isLoading,
    viewerImage,
    collections,
    isCollectionLoading,
    isSaveModalOpen,
    setIsSaveModalOpen,
    openSaveModal,
    fetchCollections,
    openImageViewer: (src: string, alt: string) => setViewerImage({ src, alt }),
    closeImageViewer: () => setViewerImage(null),
  };
}
