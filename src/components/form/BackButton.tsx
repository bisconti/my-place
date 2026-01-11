import type { JSX } from "react";
import { useNavigate } from "react-router-dom";

interface Props {
  path: string;
}

export default function BackButton({ path }: Props): JSX.Element {
  const navigate = useNavigate();
  return (
    <button
      onClick={() => navigate(path)}
      className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600 p-1 transition duration-150"
    >
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path>
      </svg>
    </button>
  );
}
