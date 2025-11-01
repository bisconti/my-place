const MainContent = () => {
    return (
        <main className="max-w-7xl mx-auto mt-8 p-4">
            <h2 className="text-3xl font-bold text-gray-800">
                메인 화면
            </h2>
            <p className="mt-4 text-gray-600">
                탐색하기
            </p>
            <div className="h-96 bg-white border border-dashed border-gray-300 mt-6 rounded-lg p-4 flex items-center justify-center text-gray-500 shadow-inner">
                메인 콘텐츠 영역
            </div>
        </main>
    )
}

export default MainContent