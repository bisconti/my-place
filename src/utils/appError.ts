/*
  file: appError.ts
  description
  - 에러 로그와 사용자 노출 문구를 분리해서 처리하기 위한 공통 유틸 파일
*/
type HandleAppErrorOptions = {
  fallbackMessage: string;
  notify?: (message: string) => void;
  logLabel?: string;
};

export function resolveErrorMessage(error: unknown, fallbackMessage: string) {
  if (typeof error === "object" && error !== null && "message" in error) {
    const message = (error as { message?: unknown }).message;
    if (typeof message === "string" && message.trim()) {
      return message;
    }
  }

  return fallbackMessage;
}

export function handleAppError(error: unknown, options: HandleAppErrorOptions) {
  const { fallbackMessage, notify, logLabel } = options;
  const message = resolveErrorMessage(error, fallbackMessage);

  if (logLabel) {
    console.error(logLabel, error);
  } else {
    console.error(error);
  }

  notify?.(message);
  return message;
}
