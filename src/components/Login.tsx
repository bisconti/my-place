import { yupResolver } from "@hookform/resolvers/yup";
import React from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { Link, useNavigate } from "react-router-dom"
import * as yup from 'yup';

// 로그인 폼 유효성 검증 스키마 정의
const LoginSchema = yup.object({
    email: yup
        .string()
        .matches(/^[^@\s]+@[^@\s]+\.[^@\s]+$/, '올바른 이메일 형식이 아닙니다.')
        .required('이메일을 입력하세요.'),
    password: yup
        .string()
        .required('비밀번호를 입력하세요.')
}).required();

// 로그인 폼 데이터 타입 추론
type LoginFormData = yup.InferType<typeof LoginSchema>;

const Login = () => {
    const navigate = useNavigate();

    // useForm 초기화, yupResolver 적용
    const { register, handleSubmit, formState: { errors }} = useForm<LoginFormData>({
        resolver: yupResolver(LoginSchema),
        mode: 'onSubmit'
    });

    // 유효성 검증 통과 시 실행
    const onSubmit: SubmitHandler<LoginFormData> = (data) => {
        console.log(data);
        // login API 호출
    }

    // error message control
    const handleErrorMsg = React.useMemo(() => {
        const errorKeys = Object.keys(errors);

        if (errorKeys.length > 0) {
            const errorKey = errorKeys[0] as keyof LoginFormData;
            return errors[errorKey]?.message;
        }
        return null;
    }, [errors]);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="w-full max-w-md bg-white p-8 rounded-xl shadow-2xl space-y-6">

                {/* 뒤로가기 버튼 & 타이틀 */}
                <div className="relative">
                    {/* 뒤로가기 버튼 */}
                    <button
                        onClick={() => navigate('/')}
                        className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600 p-1"
                        aria-label="메인 페이지로 돌아가기"
                    >
                        {/* 왼쪽 화살표 아이콘 */}
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    </button>
                    <h2 className="text-3xl font-bold text-center text-red-600">로그인</h2>
                </div>

                <p className="text-center text-gray-500">맛집 탐방을 시작해 보세요.</p>

                {/* 로그인 폼 */}
                <form className="space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
                    {/* email field */}
                    <div className="flex items-center space-x-4">
                        <label htmlFor="email" className="flex-shrink-0 w-24 text-sm font-medium text-gray-700">이메일 주소</label>
                        <input
                            id="email"
                            type="text"
                            autoComplete="off"
                            {...register('email')}
                            className={`flex-1 px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                            placeholder="youremail@gmail.com"
                        />
                    </div>

                    {/* password field */}
                    <div className="flex items-center space-x-4">
                        <label htmlFor="password" className="flex-shrink-0 w-24 text-sm font-medium text-gray-700">비밀번호</label>
                        <input
                            id="password"
                            type="password"
                            {...register('password')}
                            className={`flex-1 px-3 py-2 border ${errors.password ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                            placeholder="비밀번호"
                        />
                    </div>

                    {/* 유효성 검증 오류 메시지 표시 */}
                    {handleErrorMsg && (
                        <div className="pt-2">
                            <p className="text-xs text-red-500 text-center w-full">
                                {handleErrorMsg}
                            </p>
                        </div>
                    )}

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
                        to="/signup"
                        className="font-medium text-gray-500 hover:text-red-500"
                    >
                        회원가입
                    </Link>
                    <Link
                        to="/find-password"
                        className="font-medium text-red-600 hover:text-red-500"
                    >
                        비밀번호 찾기    
                    </Link>
                </div>

            </div>
        </div>
    )
}

export default Login