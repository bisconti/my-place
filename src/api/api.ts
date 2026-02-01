import axios from "axios";
import { runOnUnauthorized } from "../stores/authStore";

export const api = axios.create({
  withCredentials: true, // 쿠키 안 쓰면 지워도 됨
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// 토큰 만료/미인증 공통 처리
api.interceptors.response.use(
  (res) => res,
  (error) => {
    const status = error?.response?.status;

    if (status === 401 || status === 403) {
      runOnUnauthorized();
      return;
    }

    return Promise.reject(error);
  }
);
