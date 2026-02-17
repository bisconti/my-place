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
