// 세션 만료 시 Auth 상태 삭제
let onUnauthorized: (() => void) | null = null;

export const setOnUnauthorized = (fn: () => void) => {
  onUnauthorized = fn;
};

export const runOnUnauthorized = () => {
  onUnauthorized?.();
};
