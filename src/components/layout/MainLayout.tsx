/*
  file: MainLayout.tsx
  description
  - 헤더와 메인 콘텐츠를 묶는 메인 레이아웃 컴포넌트
*/
import { useAuthAutoRefresh } from "../../hooks/useAuthAutoRefresh";
import Header from "./Header";
import MainContent from "./MainContent";

const MainLayout = () => {
  useAuthAutoRefresh();

  return (
    <div className="h-screen min-h-0 overflow-hidden bg-gray-50 flex flex-col">
      <div className="shrink-0">
        <Header />
      </div>
      <main className="flex-1 min-h-0 overflow-hidden">
        <MainContent />
      </main>
    </div>
  );
};

export default MainLayout;
