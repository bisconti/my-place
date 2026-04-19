/*
  file: usePlaceLikeState.ts
  description
  - 식당 목록의 찜 상태 조회와 optimistic update 흐름을 관리하는 훅
*/
import { useCallback, useEffect, useState, type Dispatch, type SetStateAction } from "react";
import { fetchMyLikeIds, togglePlaceLike } from "../api/place/placeLike.api";
import { useAuthStore } from "../stores/authStore";
import type { Place } from "../types/place/place.types";

type UsePlaceLikeStateParams = {
  places: Place[];
  setPlaces: Dispatch<SetStateAction<Place[]>>;
};

export function usePlaceLikeState({ places, setPlaces }: UsePlaceLikeStateParams) {
  const isLoggedIn = useAuthStore((state) => !!state.user);
  const [likedIds, setLikedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (!isLoggedIn) {
      setLikedIds(new Set());
      return;
    }

    (async () => {
      try {
        const response = await fetchMyLikeIds();
        setLikedIds(new Set(response.data.items.map((item) => String(item.placeId))));
      } catch (error) {
        console.error(error);
        setLikedIds(new Set());
      }
    })();
  }, [isLoggedIn]);

  useEffect(() => {
    if (places.length === 0) return;

    setPlaces((prev) =>
      prev.map((place) => ({
        ...place,
        liked: likedIds.has(place.id),
      }))
    );
  }, [likedIds, places.length, setPlaces]);

  const toggleLikeById = useCallback(
    async (id: string) => {
      const target = places.find((place) => place.id === id);
      if (!target) return;

      const previousLiked = target.liked ?? false;
      const nextLiked = !previousLiked;

      setPlaces((prev) =>
        prev.map((place) =>
          place.id === id
            ? {
                ...place,
                liked: nextLiked,
                likeCount: Math.max(0, (place.likeCount ?? 0) + (nextLiked ? 1 : -1)),
              }
            : place
        )
      );

      try {
        const response = await togglePlaceLike(target, nextLiked);

        setLikedIds((prev) => {
          const next = new Set(prev);
          if (response.data.liked) {
            next.add(id);
          } else {
            next.delete(id);
          }
          return next;
        });
      } catch (error) {
        setPlaces((prev) =>
          prev.map((place) =>
            place.id === id
              ? {
                  ...place,
                  liked: previousLiked,
                  likeCount: Math.max(0, (place.likeCount ?? 0) + (previousLiked ? 1 : -1)),
                }
              : place
          )
        );
        console.error(error);
        alert("찜 처리에 실패했어요. 잠시 후 다시 시도해주세요.");
      }
    },
    [places, setPlaces]
  );

  return {
    likedIds,
    toggleLikeById,
  };
}
