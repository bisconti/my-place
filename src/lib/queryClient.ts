/*
  file: queryClient.ts
  description
  - 애플리케이션 전역에서 사용하는 React Query 클라이언트 설정 파일
*/
import { QueryClient } from "@tanstack/react-query";

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60_000,
      gcTime: 5 * 60_000,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});
