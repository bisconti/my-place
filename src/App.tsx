import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./App.css";
import MainLayout from "./components/MainLayout";
import Login from "./components/Login";
import { AuthProvider } from "./contexts/AuthProvider";
import SignUp from "./components/SignUp";
import FindPassword from "./components/FindPassword";
import ResetPassword from "./components/ResetPassword";

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
          </Routes>
        </div>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
