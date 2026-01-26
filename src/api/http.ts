import axios from "axios";

export const http = axios.create({
  withCredentials: false,
});

// 요청 인터셉터: 토큰 자동 주입
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `${token}`;
  }
  return config;
});
