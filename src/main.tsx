/*
  file: main.tsx
  description
  - React 앱을 시작하고 루트 컴포넌트를 렌더링하는 엔트리 파일
*/
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";

createRoot(document.getElementById("root")!).render(
  <>
    <App />
  </>
);
