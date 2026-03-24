/*
  파일명: http.ts
  기능 
  - api.ts와 달리 인증이 필요없는 API 요청을 관리
  - 헤더에 토큰 주입만 담당
*/
import axios from "axios";
import { authStorage } from "../stores/authStorage";

export const http = axios.create({
  withCredentials: false,
});

// 토큰 자동 주입
http.interceptors.request.use((config) => {
  const token = authStorage.getAccessToken();

  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});
