/*
  파일명 MyPageMenu.tsx
  기능
  - 마이페이지 우측 메뉴 버튼 묶음을 렌더링
*/
import MenuButton from "./MenuButton";

type MyPageMenuProps = {
  onProfile: () => void;
  onChangePassword: () => void;
  onCollections: () => void;
  onFavorites: () => void;
  onReviews: () => void;
  onSettings: () => void;
  onLogout: () => void;
};

const MyPageMenu = ({
  onProfile,
  onChangePassword,
  onCollections,
  onFavorites,
  onReviews,
  onSettings,
  onLogout,
}: MyPageMenuProps) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">메뉴</h3>

      <div className="space-y-2">
        <MenuButton label="내 정보" desc="프로필과 소개글을 수정합니다" onClick={onProfile} />
        <MenuButton label="비밀번호 변경" desc="계정 보안을 위해 비밀번호를 변경합니다" onClick={onChangePassword} />
        <MenuButton label="저장 리스트" desc="내가 만든 식당 리스트를 관리합니다" onClick={onCollections} />
        <MenuButton label="찜한 맛집" desc="좋아요를 누른 식당을 확인합니다" onClick={onFavorites} />
        <MenuButton label="내 리뷰" desc="작성한 리뷰를 관리합니다" onClick={onReviews} />
        <MenuButton label="설정" desc="알림과 계정 설정을 확인합니다" onClick={onSettings} />
      </div>

      <div className="border-t mt-4 pt-4">
        <button
          type="button"
          onClick={onLogout}
          className="w-full py-2 text-sm font-medium rounded-lg text-red-600 border border-red-200 hover:bg-red-50 transition"
        >
          로그아웃
        </button>
      </div>
    </div>
  );
};

export default MyPageMenu;
