/*
  file: MyPageStats.tsx
  description
  - 마이페이지 상단의 통계 카드 영역을 렌더링하는 컴포넌트
*/
export type MyPageStatItem = {
  label: string;
  value: number;
  desc: string;
  onClick?: () => void;
};

type MyPageStatsProps = {
  stats: MyPageStatItem[];
  isLoading?: boolean;
};

const MyPageStats = ({ stats, isLoading = false }: MyPageStatsProps) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
      {stats.map((stat) => (
        <button
          key={stat.label}
          type="button"
          onClick={stat.onClick}
          disabled={!stat.onClick}
          className={`bg-white rounded-xl shadow-md p-6 text-left transition ${
            stat.onClick ? "hover:shadow-lg hover:-translate-y-0.5 cursor-pointer" : "cursor-default"
          }`}
        >
          <p className="text-sm text-gray-500">{stat.label}</p>
          <p className="text-3xl font-bold text-gray-900 mt-2">{isLoading ? "-" : stat.value}</p>
          <p className="text-xs text-gray-400 mt-2">{stat.desc}</p>
        </button>
      ))}
    </div>
  );
};

export default MyPageStats;
