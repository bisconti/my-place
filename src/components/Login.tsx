import { Link } from "react-router-dom"

const Login = () => {
    // react-router-dom 라이브러리 사용
    //const navigate = useNavigate();

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl space-y-6">
                <h2 className="text-3xl font-bold text-center text-red-600">로그인</h2>
                <p className="text-center text-gray-500">맛집 탐방을 시작해 보세요.</p>

                {/* 로그인 폼 */}
                <form className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">이메일 주소</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            required
                            className="appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-red-500 focus:border-red-500 sm:text-sm"
                            placeholder="비밀번호"
                        />
                    </div>

                    {/* 로그인 버튼 */}
                    <button
                        type="submit"
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-lg text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition duration-150"
                    >
                        로그인   
                    </button>
                </form>

                <div className="flex justify-between items-center text-sm">
                    <Link
                        to="/find-password"
                        className="font-medium text-red-600 hover:text-red-500"
                    >
                        비밀번호 찾기    
                    </Link>
                    <Link
                        to="/signup"
                        className="font-medium text-gray-500 hover:text-red-500"
                    >
                        회원가입
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default Login