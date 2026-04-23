/*
  file: messages.ts
  description
  - 화면 전반에서 재사용하는 사용자 노출 문구를 모아두는 상수 파일
*/
export const APP_MESSAGES = {
  auth: {
    loginTitle: "로그인",
    loginSubtitle: "맛집 탐색을 시작해보세요",
    loginSuccess: "로그아웃되었습니다.",
    loginFailed: "로그인에 실패했습니다.",
    loginInvalid: "이메일 또는 비밀번호를 확인해주세요.",
    sessionExpired: "세션이 만료되어 로그아웃되었어요.",
    logoutSuccess: "로그아웃되었습니다.",
    networkError: "네트워크 연결 또는 서버 상태를 확인해주세요.",
    emailRequired: "이메일 주소를 입력해주세요.",
  },
  header: {
    brandName: "잇츠맵",
    searchPlaceholder: "식당, 메뉴, 지역을 검색해보세요",
    searchLoading: "검색 중입니다...",
    searchEmpty: "검색 결과가 없습니다.",
    notificationsTitle: "알림",
    notificationsSubtitle: "최근 알림을 확인해보세요.",
    notificationsLoading: "알림을 불러오는 중입니다...",
    notificationsEmpty: "아직 알림이 없습니다.",
    notificationsReadAll: "전체 읽음",
    notificationsViewAll: "전체 알림 보기",
    notificationActionFailed: "알림 처리에 실패했습니다.",
  },
  placeCollection: {
    title: "저장 리스트",
    descriptionSuffix: "을 저장할 리스트를 골라주세요.",
    emptyName: "리스트 이름을 입력해주세요.",
    createSuccess: "저장 리스트를 만들었어요.",
    createFailed: "저장 리스트를 만들지 못했습니다.",
    alreadySaved: "이미 이 리스트에 저장되어 있어요.",
    saveSuccess: "리스트에 저장했어요.",
    saveFailed: "리스트 저장에 실패했습니다.",
    loading: "저장 리스트를 불러오는 중입니다...",
    empty: "아직 만든 저장 리스트가 없습니다. 위에서 새 리스트를 만들어보세요.",
    createLabel: "리스트 생성",
    creating: "생성 중...",
    saving: "저장 중...",
    saved: "저장됨",
    saveAction: "여기에 저장",
    close: "닫기",
  },
  imageViewer: {
    close: "닫기",
  },
} as const;
