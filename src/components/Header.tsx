import { useNavigate } from "react-router-dom";
import { useAuth } from "../contexts/useAuth";

const Header = () => {
    // react-router-dom 라이브러리 사용
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    return (
        // 헤더 컨테이너
        <header className="sticky top-0 z-50 bg-white shadow-md">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* 로고, 검색창, 메뉴 가로로 배치 */}
                <div className="flex justify-between items-center h-16">
                    {/* 로고/사이트 이름 */}
                    <div className="flex-shrink-0">
                        <a href="/" className="text-2xl font-bold text-red-600 hover:text-red-700">
                            식신 따라하기
                        </a>
                    </div>

                    {/* 중앙 검색창 */}
                    <div className="hidden] md:flex flex-grow max-w-lg mx-8">
                        <div className="relative w-full">
                            <input 
                                type="text"
                                placeholder="식당, 메뉴, 지역을 검색해보세요"
                                className="w-full py-2 pl-4 pr-10 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500"
                            />

                            {/* 검색 아이콘 */}
                            <button className="absolute right-0 top-0 mt-2 mr-3 text-gray-500 hover:text-red-600" aria-label="검색 실행">
                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
                            </button>
                        </div>
                    </div>

                    {/* 우측 메뉴/로그인 영역 */}
                    <div className="flex items-center space-x-4">

                        {user ? (
                            // ⭐️ 로그인 상태: 닉네임과 로그아웃 버튼 표시
                            <div className="flex items-center space-x-4 p-2 bg-indigo-50 rounded-full">
                            <span className="text-indigo-700 text-sm font-semibold ml-2">
                                {/* 닉네임 표시 */}
                                {user.username} 님 환영합니다!
                            </span>
                            <button
                                onClick={() => {
                                logout();
                                navigate('/');
                                }}
                                className="px-4 py-1 text-sm font-medium text-white bg-indigo-600 rounded-full shadow-lg hover:bg-indigo-700 transition duration-150 transform hover:scale-105"
                            >
                                로그아웃
                            </button>
                            </div>
                        ) : (
                            // ⭐️ 로그아웃 상태: 로그인 버튼 표시
                            <button
                            onClick={() => navigate('login')}
                            className="px-5 py-2 text-sm font-medium text-white bg-indigo-500 rounded-lg shadow-md hover:bg-indigo-600 transition duration-150 transform hover:scale-105"
                            >
                            로그인
                            </button>
                        )}
                        
                        {/* 모바일 메뉴/아이콘 (User 아이콘 예시) */}
                        <button className="text-gray-600 hover:text-red-600 focus:outline-none" aria-label="사용자 메뉴">
                            {/* 사용자 아이콘 (예시: SVG) */}
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14c-4.418 0-8 3.582-8 8h16c0-4.418-3.582-8-8-8z"></path></svg>
                        </button>
                    </div>
                </div>
            </div>
        </header>
    )
}

export default Header;