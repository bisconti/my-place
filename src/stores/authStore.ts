const BOOT_GRACE_MS = 2500; // 2.5초: 필요하면 1500~4000 사이로 조절
let bootAt = Date.now();

export const isDuringBoot = () => Date.now() - bootAt < BOOT_GRACE_MS;

// 앱이 완전히 살아난 후 리셋하고 싶으면 선택적으로 호출 가능
export const resetBootAt = () => {
  bootAt = Date.now();
};

type UnauthorizedOptions = { silent?: boolean };

// 세션 만료 시 Auth 상태 삭제
let onUnauthorized: ((opts?: UnauthorizedOptions) => void) | null = null;

export const setOnUnauthorized = (fn: (opts?: UnauthorizedOptions) => void) => {
  onUnauthorized = fn;
};

export const runOnUnauthorized = (opts?: UnauthorizedOptions) => {
  onUnauthorized?.(opts);
};
