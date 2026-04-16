/*
  file: vite.config.ts
  description
  - Vite 개발 서버와 번들 빌드 옵션을 설정하는 파일
*/
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // path 설정 추가
  resolve: {
    alias: [
      {
        find: "@src",
        replacement: path.resolve(__dirname, "src"),
      },
      {
        find: "@components",
        replacement: path.resolve(__dirname, "src/components"),
      },
    ],
  },
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3001",
        changeOrigin: true,
        secure: false,
      },
      "/auth": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
      "/user": {
        target: "http://localhost:3001",
        changeOrigin: true,
      },
    },
  },
});
