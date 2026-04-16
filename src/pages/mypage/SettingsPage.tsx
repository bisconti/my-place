/*
  file: SettingsPage.tsx
  description
  - 마이페이지 설정 화면을 감싸는 페이지 컴포넌트
*/
import NotificationSettingsSection from "../../components/mypage/settings/NoticifationSettingsSection";
import BackButton from "../../components/form/BackButton";

const SettingsPage = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* 헤더 */}
        <div className="relative mb-6">
          <BackButton path="/mypage" />

          <h1 className="text-2xl sm:text-3xl font-bold text-center text-red-600">설정</h1>

          <p className="text-center text-gray-500 mt-2">앱 사용 환경과 알림 옵션을 설정하세요.</p>
        </div>

        {/* 콘텐츠 */}
        <NotificationSettingsSection />
      </div>
    </div>
  );
};

export default SettingsPage;
