/*
  file: main.tsx
  description
  - React 앱을 시작하고 전역 Provider를 연결한 뒤 루트 컴포넌트를 렌더링하는 엔트리 파일
*/
import { QueryClientProvider } from "@tanstack/react-query";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { queryClient } from "./lib/queryClient";

createRoot(document.getElementById("root")!).render(
  <QueryClientProvider client={queryClient}>
    <App />
  </QueryClientProvider>
);
