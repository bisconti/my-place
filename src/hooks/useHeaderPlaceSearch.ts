/*
  file: useHeaderPlaceSearch.ts
  description
  - 헤더 자동완성 검색어 입력, 추천 목록 조회, 상세 이동 흐름을 관리하는 훅
*/
import { useCallback, useEffect, useRef, useState } from "react";
import { getPlaceAutoCompleteList, getPlaceDetail } from "../api/place/place.api";
import type { PlaceAutoCompleteItem } from "../types/place/place.types";

type HeaderPlaceSearchActions = {
  onNavigateToPlace: (placeId: string, place: Awaited<ReturnType<typeof getPlaceDetail>>) => void;
  onError: (message: string) => void;
  onEmptyResult: (message: string) => void;
};

export function useHeaderPlaceSearch(actions: HeaderPlaceSearchActions) {
  const [searchKeyword, setSearchKeyword] = useState("");
  const [suggestions, setSuggestions] = useState<PlaceAutoCompleteItem[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isSearchLoading, setIsSearchLoading] = useState(false);

  const searchRef = useRef<HTMLDivElement | null>(null);

  const fetchSuggestions = useCallback(async (keyword: string) => {
    const trimmedKeyword = keyword.trim();

    if (!trimmedKeyword) {
      setSuggestions([]);
      setIsSearchOpen(false);
      return;
    }

    try {
      setIsSearchLoading(true);
      const data = await getPlaceAutoCompleteList(trimmedKeyword);
      setSuggestions(data);
      setIsSearchOpen(true);
    } catch (error) {
      console.error("식당 자동완성 조회 실패", error);
      setSuggestions([]);
      setIsSearchOpen(false);
    } finally {
      setIsSearchLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!searchKeyword.trim()) {
      setSuggestions([]);
      setIsSearchOpen(false);
      return;
    }

    const timer = window.setTimeout(() => {
      void fetchSuggestions(searchKeyword);
    }, 250);

    return () => window.clearTimeout(timer);
  }, [fetchSuggestions, searchKeyword]);

  const handleSelectSuggestion = useCallback(
    async (item: PlaceAutoCompleteItem) => {
      try {
        setSearchKeyword(item.placeName);
        setIsSearchOpen(false);

        const place = await getPlaceDetail(item.placeId);
        actions.onNavigateToPlace(item.placeId, place);
      } catch (error) {
        console.error("식당 상세 이동 실패", error);
        actions.onError("식당 정보를 불러오지 못했습니다.");
      }
    },
    [actions]
  );

  const handleSubmitSearch = useCallback(async () => {
    if (!searchKeyword.trim()) return;

    if (suggestions.length > 0) {
      await handleSelectSuggestion(suggestions[0]);
      return;
    }

    actions.onEmptyResult("일치하는 식당을 찾지 못했습니다.");
  }, [actions, handleSelectSuggestion, searchKeyword, suggestions]);

  return {
    searchRef,
    searchKeyword,
    setSearchKeyword,
    suggestions,
    isSearchOpen,
    isSearchLoading,
    setIsSearchOpen,
    handleSelectSuggestion,
    handleSubmitSearch,
  };
}
