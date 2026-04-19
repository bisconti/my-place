/*
  file: usePlaceDetailData.ts
  description
  - 식당 상세 페이지의 조회, 최근 방문 저장, 저장 리스트 조회, 이미지 뷰어 상태를 관리하는 훅
*/
import { useCallback, useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import { getMyPlaceCollections } from "../api/place/placeCollection.api";
import { getPlaceDetail } from "../api/place/place.api";
import { getPlaceReviews, getPlaceReviewSummary } from "../api/place/placeReview.api";
import { saveRecentPlaceApi } from "../api/place/recentPlace.api";
import { useAuthStore } from "../stores/authStore";
import type { PlaceCollectionSummary } from "../types/place/placeCollection.types";
import type { Place } from "../types/place/place.types";
import type { PlaceReviewResponse, PlaceReviewSummaryResponse } from "../types/place/placeReview.types";

type ViewerImage = {
  src: string;
  alt: string;
};

export function usePlaceDetailData(placeId?: string, initialPlace?: Place | null) {
  const token = useAuthStore((state) => state.token);

  const [place, setPlace] = useState<Place | null>(initialPlace ?? null);
  const [isPlaceLoading, setIsPlaceLoading] = useState(!initialPlace && !!placeId);
  const [reviewSummary, setReviewSummary] = useState<PlaceReviewSummaryResponse | null>(null);
  const [reviews, setReviews] = useState<PlaceReviewResponse[]>([]);
  const [isReviewLoading, setIsReviewLoading] = useState(false);
  const [viewerImage, setViewerImage] = useState<ViewerImage | null>(null);
  const [collections, setCollections] = useState<PlaceCollectionSummary[]>([]);
  const [isCollectionLoading, setIsCollectionLoading] = useState(false);
  const [isSaveModalOpen, setIsSaveModalOpen] = useState(false);

  const recentPlaceSavedRef = useRef(false);

  useEffect(() => {
    if (!placeId || initialPlace) return;

    const fetchPlaceDetail = async () => {
      try {
        setIsPlaceLoading(true);
        const data = await getPlaceDetail(placeId);
        setPlace(data);
      } catch (error) {
        console.error("식당 상세 조회 실패", error);
        setPlace(null);
      } finally {
        setIsPlaceLoading(false);
      }
    };

    void fetchPlaceDetail();
  }, [initialPlace, placeId]);

  useEffect(() => {
    if (!placeId) return;

    const fetchReviewData = async () => {
      try {
        setIsReviewLoading(true);
        const [summaryRes, reviewsRes] = await Promise.all([getPlaceReviewSummary(placeId), getPlaceReviews(placeId)]);
        setReviewSummary(summaryRes.data);
        setReviews(reviewsRes.data);
      } catch (error) {
        console.error("리뷰 데이터 조회 실패", error);
      } finally {
        setIsReviewLoading(false);
      }
    };

    void fetchReviewData();
  }, [placeId]);

  useEffect(() => {
    if (!token || !place?.id || recentPlaceSavedRef.current) return;

    recentPlaceSavedRef.current = true;
    saveRecentPlaceApi({ placeId: place.id }).catch(() => {
      console.warn("최근 방문 식당 저장 실패");
    });
  }, [place, token]);

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
    if (!place?.id) return;

    try {
      setIsCollectionLoading(true);
      const { data } = await getMyPlaceCollections(place.id);
      setCollections(data.items ?? []);
    } catch (error) {
      console.error("저장 리스트 조회 실패", error);
      toast.error("저장 리스트를 불러오지 못했습니다.");
    } finally {
      setIsCollectionLoading(false);
    }
  }, [place?.id]);

  const openSaveModal = useCallback(async () => {
    setIsSaveModalOpen(true);
    await fetchCollections();
  }, [fetchCollections]);

  return {
    token,
    place,
    isPlaceLoading,
    reviewSummary,
    reviews,
    isReviewLoading,
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
