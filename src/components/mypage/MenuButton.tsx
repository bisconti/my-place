/*
  파일명: MenuButton.tsx
  describe
  - 마이페이지 좌측 메뉴 tab button component
*/
type MenuButtonProps = {
  label: string;
  desc: string;
  onClick: () => void;
};

const MenuButton = ({ label, desc, onClick }: MenuButtonProps) => {
  return (
    <button
      type="button"
      onClick={onClick}
      className="w-full text-left p-3 rounded-lg border border-gray-200 hover:border-red-200 hover:bg-red-50 transition"
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="text-sm font-semibold text-gray-900">{label}</p>
          <p className="text-xs text-gray-500 mt-1">{desc}</p>
        </div>
        <span className="text-gray-400">›</span>
      </div>
    </button>
  );
};

export default MenuButton;
