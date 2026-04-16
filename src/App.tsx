/*
  file: App.tsx
  description
  - 애플리케이션의 라우팅과 주요 페이지 구성을 담당하는 최상위 컴포넌트
*/
import { BrowserRouter, Route, Routes } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import "./App.css";
import MainLayout from "./components/layout/MainLayout";
import ChangePassword from "./components/mypage/ChangePassword";
import { AuthProvider } from "./contexts/AuthProvider";
import FindPasswordPage from "./pages/auth/FindPasswordPage";
import LoginPage from "./pages/auth/LoginPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import SignUpPage from "./pages/auth/SignUpPage";
import EditProfilePage from "./pages/mypage/EditProfilePage";
import MyReviewsPage from "./pages/mypage/MyReviewPage";
import MyPage from "./pages/mypage/MyPage";
import SettingsPage from "./pages/mypage/SettingsPage";
import FavoritesPage from "./pages/mypage/favorites/FavoritesPage";
import PlaceCollectionDetailPage from "./pages/mypage/placeCollections/PlaceCollectionDetailPage";
import PlaceCollectionPage from "./pages/mypage/placeCollections/PlaceCollectionPage";
import PlaceDetailPage from "./pages/place/PlaceDetailPage";
import ReviewWritePage from "./pages/review/ReviewWritePage";

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            duration: 2000,
            style: {
              borderRadius: "10px",
              fontSize: "14px",
            },
          }}
        />

        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<MainLayout />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignUpPage />} />
            <Route path="/find-password" element={<FindPasswordPage />} />
            <Route path="/reset-password" element={<ResetPasswordPage />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/mypage/profile" element={<EditProfilePage />} />
            <Route path="/mypage/change-password" element={<ChangePassword />} />
            <Route path="/mypage/place-collections" element={<PlaceCollectionPage />} />
            <Route path="/mypage/place-collections/:collectionId" element={<PlaceCollectionDetailPage />} />
            <Route path="/mypage/favorites" element={<FavoritesPage />} />
            <Route path="/mypage/reviews" element={<MyReviewsPage />} />
            <Route path="/mypage/settings" element={<SettingsPage />} />
            <Route path="/places/:placeId" element={<PlaceDetailPage />} />
            <Route path="/places/:placeId/reviews/write" element={<ReviewWritePage />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
