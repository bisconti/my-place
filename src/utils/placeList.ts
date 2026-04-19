/*
  file: placeList.ts
  description
  - 식당 목록의 정렬, 필터링, 메타데이터 병합 규칙을 모아둔 유틸 파일
*/
import type { Place, PlaceListFilterState, PlaceListMetadataItem, PlaceSortOption } from "../types/place/place.types";

function compareNumberDesc(a?: number, b?: number) {
  return (b ?? 0) - (a ?? 0);
}

function compareNumberAsc(a?: number, b?: number) {
  return (a ?? Number.MAX_SAFE_INTEGER) - (b ?? Number.MAX_SAFE_INTEGER);
}

export function applyPlaceListFiltersAndSort(
  items: Place[],
  sortBy: PlaceSortOption,
  filters: PlaceListFilterState
) {
  const filtered = items.filter((item) => {
    if (filters.featuredLiveInfoTv && !item.featuredLiveInfoTv) return false;
    if (filters.featuredLifeMaster && !item.featuredLifeMaster) return false;
    if (filters.featuredBaekbanTrip && !item.featuredBaekbanTrip) return false;
    return true;
  });

  return filtered.sort((a, b) => {
    switch (sortBy) {
      case "reviewCount":
        return compareNumberDesc(a.reviewCount, b.reviewCount) || compareNumberDesc(a.rating, b.rating);
      case "rating":
        return compareNumberDesc(a.rating, b.rating) || compareNumberDesc(a.reviewCount, b.reviewCount);
      case "likeCount":
        return compareNumberDesc(a.likeCount, b.likeCount) || compareNumberDesc(a.rating, b.rating);
      case "distance":
      default:
        return compareNumberAsc(a.distanceM, b.distanceM) || compareNumberDesc(a.rating, b.rating);
    }
  });
}

export function mergePlaceListMetadata(basePlaces: Place[], metadataItems: PlaceListMetadataItem[], likedIds: Set<string>) {
  const metadataMap = new Map(metadataItems.map((item) => [String(item.placeId), item]));

  return basePlaces.map((place) => {
    const metadata = metadataMap.get(place.id);

    return {
      ...place,
      thumbnail: metadata?.thumbnail,
      rating: metadata?.rating ?? 0,
      reviewCount: metadata?.reviewCount ?? 0,
      likeCount: metadata?.likeCount ?? 0,
      liked: likedIds.has(place.id) || metadata?.liked,
      featuredLiveInfoTv: metadata?.featuredLiveInfoTv ?? false,
      featuredLifeMaster: metadata?.featuredLifeMaster ?? false,
      featuredBaekbanTrip: metadata?.featuredBaekbanTrip ?? false,
    };
  });
}
