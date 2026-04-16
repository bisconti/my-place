/*
  file: NoticifationSettingsSection.tsx
  description
  - 사용자 알림 설정 항목을 표시하고 변경하는 컴포넌트
*/
import { useEffect, useState } from "react";
import type { NotificationSettings } from "../../../types/settings/userSettings.type";
import { getNotificationSettings, updateNotificationSettings } from "../../../api/settings/userSetting.api";

const NotificationSettingsSection = () => {
  const [settings, setSettings] = useState<NotificationSettings>({
    reviewReminderEnabled: true,
    favoritePlaceEventEnabled: true,
    recommendationEnabled: true,
    visitReminderEnabled: true,
  });

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const data = await getNotificationSettings();
        setSettings(data);
      } catch (error) {
        console.error("알림 설정 조회 실패", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, []);

  const handleToggle = async (key: keyof NotificationSettings) => {
    const prevSettings = settings;

    const updatedSettings = {
      ...settings,
      [key]: !settings[key],
    };

    setSettings(updatedSettings);

    try {
      setIsSaving(true);
      const saved = await updateNotificationSettings(updatedSettings);
      setSettings(saved);
    } catch (error) {
      console.error("알림 설정 저장 실패", error);
      alert("알림 설정 저장에 실패했습니다.");
      setSettings(prevSettings);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <div className="text-center py-10 text-gray-500">알림 설정을 불러오는 중...</div>;
  }

  return (
    <div className="bg-white rounded-2xl shadow-sm border p-6">
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-800">알림 설정</h3>
        <p className="text-sm text-gray-500 mt-1">받고 싶은 알림만 선택할 수 있어요.</p>
      </div>

      <div className="divide-y">
        <SettingItem
          title="리뷰 작성 리마인드"
          desc="방문 후 리뷰를 남기도록 알려드립니다."
          checked={settings.reviewReminderEnabled}
          onToggle={() => handleToggle("reviewReminderEnabled")}
          disabled={isSaving}
        />

        <SettingItem
          title="찜한 맛집 소식"
          desc="찜한 맛집 관련 이벤트나 소식을 알려드립니다."
          checked={settings.favoritePlaceEventEnabled}
          onToggle={() => handleToggle("favoritePlaceEventEnabled")}
          disabled={isSaving}
        />

        <SettingItem
          title="맞춤 추천 알림"
          desc="회원님의 취향에 맞는 맛집을 추천해 드립니다."
          checked={settings.recommendationEnabled}
          onToggle={() => handleToggle("recommendationEnabled")}
          disabled={isSaving}
        />

        <SettingItem
          title="방문 기록 리마인드"
          desc="최근 방문한 맛집 기록을 남기도록 안내합니다."
          checked={settings.visitReminderEnabled}
          onToggle={() => handleToggle("visitReminderEnabled")}
          disabled={isSaving}
        />
      </div>

      {isSaving && <div className="mt-4 text-sm text-gray-500 text-right">저장 중...</div>}
    </div>
  );
};

export default NotificationSettingsSection;

interface SettingItemProps {
  title: string;
  desc: string;
  checked: boolean;
  onToggle: () => void;
  disabled?: boolean;
}

const SettingItem = ({ title, desc, checked, onToggle, disabled = false }: SettingItemProps) => {
  return (
    <div className="flex items-center justify-between py-4">
      <div className="flex-1 pr-4">
        <p className="text-sm font-semibold text-gray-800">{title}</p>
        <p className="text-xs text-gray-500 mt-1">{desc}</p>
      </div>

      <button
        type="button"
        onClick={onToggle}
        disabled={disabled}
        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 disabled:opacity-50 ${
          checked ? "bg-red-500" : "bg-gray-300"
        }`}
      >
        <span
          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
            checked ? "translate-x-6" : "translate-x-1"
          }`}
        />
      </button>
    </div>
  );
};
