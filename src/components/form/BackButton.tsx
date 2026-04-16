/*
  file: BackButton.tsx
  description
  - 이전 화면으로 이동하는 공통 뒤로가기 버튼 컴포넌트
*/
import type { JSX } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  path: string;
}

export default function BackButton({ path }: Props): JSX.Element {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate(path);
  };

  return (
    <button
      onClick={handleBack}
      className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600 p-1 transition duration-150"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
      </svg>
    </button>
  );
}
