/*
  파일명: MyPageRecentActivities.tsx
  describe
  - 마이페이지 우측 최근 활동 component
*/
export type MyPageRecentActivityItem = {
  title: string;
  meta: string;
};

type MyPageRecentActivitiesProps = {
  activities: MyPageRecentActivityItem[];
  onViewAll: () => void;
};

const MyPageRecentActivities = ({ activities, onViewAll }: MyPageRecentActivitiesProps) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6 lg:col-span-2">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-gray-900">최근 활동</h3>
        <button onClick={onViewAll} className="text-sm font-medium text-red-600 hover:text-red-700">
          전체보기
        </button>
      </div>

      <div className="space-y-3">
        {activities.map((a, idx) => (
          <div key={`${a.title}-${idx}`} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition">
            <p className="font-semibold text-gray-900">{a.title}</p>
            <p className="text-sm text-gray-500 mt-1">{a.meta}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 p-4 rounded-lg bg-red-50 border border-red-100">
        <p className="text-sm text-red-700 font-medium">TIP</p>
        <p className="text-sm text-red-700 mt-1">맛집을 “찜”하고 리뷰를 남기면 내 활동이 이곳에 표시돼요.</p>
      </div>
    </div>
  );
};

export default MyPageRecentActivities;
