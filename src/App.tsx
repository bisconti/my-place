import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import MainLayout from "./components/layout/MainLayout";
import { AuthProvider } from "./contexts/AuthProvider";
import ChangePassword from "./components/mypage/ChangePassword";
import { Toaster } from "react-hot-toast";
import MyPage from "./pages/MyPage";
import FindPasswordPage from "./pages/auth/FindPasswordPage";
import ResetPasswordPage from "./pages/auth/ResetPasswordPage";
import LoginPage from "./pages/auth/LoginPage";
import SignUpPage from "./pages/auth/SignUpPage";
import EditProfilePage from "./pages/EditProfilePage";

function App() {
  return (
    <BrowserRouter>
      {/* AuthContextProvider로 전체 routing을 감싸서 모든 자식 component가 Context에 접근할 수 있도록 보장 */}
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
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
