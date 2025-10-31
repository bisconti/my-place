const Header = () => {
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
                        {/* 로그인 버튼 */}
                        <button className="hidden sm:inline-block text-gray-600 hover:text-red-600 font-medium">
                        로그인
                        </button>
                        
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