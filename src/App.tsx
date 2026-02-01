import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import MainLayout from "./components/layout/MainLayout";
import Login from "./components/auth/Login";
import { AuthProvider } from "./contexts/AuthProvider";
import SignUp from "./components/auth/SignUp";
import FindPassword from "./components/auth/FindPassword";
import ResetPassword from "./components/auth/ResetPassword";
import MyPage from "./components/mypage/MyPage";
import EditProfile from "./components/mypage/EditProfile";
import ChangePassword from "./components/mypage/ChangePassword";

function App() {
  return (
    <BrowserRouter>
      {/* AuthContextProvider로 전체 routing을 감싸서 모든 자식 component가 Context에 접근할 수 있도록 보장 */}
      <AuthProvider>
        <div className="min-h-screen bg-gray-50">
          <Routes>
            <Route path="/" element={<MainLayout />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<SignUp />} />
            <Route path="/find-password" element={<FindPassword />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/mypage" element={<MyPage />} />
            <Route path="/mypage/profile" element={<EditProfile />} />
            <Route path="/mypage/change-password" element={<ChangePassword />} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
