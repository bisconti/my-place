/*
  파일명: common.ts
  기능 
  - 프로젝트 전역에서 사용되는 유틸 함수 모음
*/

// 공통 데이트 형식 반환 함수
export const formatDateTime = (iso: string) => {
  const date = new Date(iso);

  const yyyy = date.getFullYear();
  const mm = String(date.getMonth() + 1).padStart(2, "0");
  const dd = String(date.getDate()).padStart(2, "0");

  const hh = String(date.getHours()).padStart(2, "0");
  const min = String(date.getMinutes()).padStart(2, "0");
  const ss = String(date.getSeconds()).padStart(2, "0");

  return `${yyyy}-${mm}-${dd} ${hh}:${min}:${ss}`;
};
