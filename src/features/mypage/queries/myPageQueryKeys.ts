/*
  file: myPageQueryKeys.ts
  description
  - 마이페이지 도메인에서 사용하는 React Query key를 한곳에서 관리하는 파일
*/
export const myPageQueryKeys = {
  all: ["mypage"] as const,
  stats: (userEmail?: string) => [...myPageQueryKeys.all, "stats", userEmail] as const,
  recentPlaces: () => [...myPageQueryKeys.all, "recent-places"] as const,
  favoritePlaces: () => [...myPageQueryKeys.all, "favorite-places"] as const,
  collections: () => [...myPageQueryKeys.all, "collections"] as const,
  collectionDetail: (collectionId?: number) => [...myPageQueryKeys.all, "collections", collectionId] as const,
  myReviews: (userEmail?: string) => [...myPageQueryKeys.all, "reviews", userEmail] as const,
};
