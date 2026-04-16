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
    <>
      <Header />
      <MainContent />
    </>
  );
};

export default MainLayout;
