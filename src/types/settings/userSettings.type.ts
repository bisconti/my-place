/*
  file: userSettings.type.ts
  description
  - 사용자 설정 관련 데이터 타입을 정의하는 파일
*/
export interface NotificationSettings {
  reviewReminderEnabled: boolean;
  favoritePlaceEventEnabled: boolean;
  recommendationEnabled: boolean;
  visitReminderEnabled: boolean;
}
