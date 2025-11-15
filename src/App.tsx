import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import MainLayout from "./components/MainLayout";
import Login from "./components/Login";
import { AuthProvider } from "./contexts/AuthProvider";
import SignUp from "./components/SignUp";

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
            <Route path="/find-password" element={<h1 className="text-3xl p-8">비밀번호 찾기 페이지</h1>} />
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
