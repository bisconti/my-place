/*
  파일명: MyPageMenu.tsx
  describe
  - 마이페이지 좌측 메뉴 패널 component
*/
import MenuButton from "./MenuButton";

type MyPageMenuProps = {
  onProfile: () => void;
  onChangePassword: () => void;
  onFavorites: () => void;
  onReviews: () => void;
  onSettings: () => void;
  onLogout: () => void;
};

const MyPageMenu = ({ onProfile, onChangePassword, onFavorites, onReviews, onSettings, onLogout }: MyPageMenuProps) => {
  return (
    <div className="bg-white rounded-xl shadow-md p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">메뉴</h3>

      <div className="space-y-2">
        <MenuButton label="내 정보" desc="프로필/닉네임 수정" onClick={onProfile} />
        <MenuButton label="비밀번호 변경" desc="보안을 위해 주기적으로 변경" onClick={onChangePassword} />
        <MenuButton label="찜한 맛집" desc="내가 저장한 리스트" onClick={onFavorites} />
        <MenuButton label="내 리뷰" desc="작성한 리뷰 관리" onClick={onReviews} />
        <MenuButton label="설정" desc="알림/계정 설정" onClick={onSettings} />
      </div>

      <div className="border-t mt-4 pt-4">
        <button
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
