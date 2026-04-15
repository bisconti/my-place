/*
  파일명: MyPageStats.tsx
  describe
  - 마이페이지 상단 리뷰, 찜한 맛집, 최근 방문 통계 component
*/
export type MyPageStatItem = {
  label: string;
  value: number;
  desc: string;
  onClick?: () => void;
};

type MyPageStatsProps = {
  stats: MyPageStatItem[];
};

const MyPageStats = ({ stats }: MyPageStatsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {stats.map((s) => (
        <button
          key={s.label}
          type="button"
          onClick={s.onClick}
          disabled={!s.onClick}
          className={`bg-white rounded-xl shadow-md p-6 text-left transition ${
            s.onClick ? "hover:shadow-lg hover:-translate-y-0.5 cursor-pointer" : "cursor-default"
          }`}
        >
          <p className="text-sm text-gray-500">{s.label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{s.value}</p>
          <p className="text-xs text-gray-400 mt-2">{s.desc}</p>
        </button>
      ))}
    </div>
  );
};

export default MyPageStats;
