import React, { useCallback, useState } from 'react';
import { useForm, type SubmitHandler, type FieldErrors, type UseFormRegister } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
// import { useAuth } from "../contexts/useAuth"; 

// 이메일 정규식, 메시지
const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const emailMsg = '올바른 이메일 형식이 아닙니다.';
// 비밀번호 정규식, 메시지
const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[!@#$%^&*()_+=-]).{8,16}$/;
const passwordMsg = '비밀번호는 8자 이상이며, 특수문자, 영문, 숫자를 모두 포함해야 합니다.';

// 회원가입 유효성 검증 스키마 정의
const RegisterSchema = yup.object({
    email: yup
        .string()
        .matches(emailRegex, emailMsg)
        .required('이메일을 입력하세요.'),
    password: yup
        .string()
        .min(8, '비밀번호는 최소 8자 이상이어야 합니다.')
        .max(8, '비밀번호는 최대 16자 이하여야 합니다.')
        .matches(passwordRegex, passwordMsg)
        .required('비밀번호를 입력하세요.'),
    name: yup
        .string()
        .min(2, '이름은 최소 2자 이상이어야 합니다.')
        .required('이름을 입력하세요.'),
    birthDate: yup
        .string()
        .required('생년월일은 필수 입력 사항입니다.')
        .matches(/^\d{4}-\d{2}-\d{2}$/, '유효한 날짜 형식(YYYY-MM-DD)을 선택해 주세요.'),
    gender: yup
        .string()
        .oneOf(['MALE', 'FEMALE', 'OTHER'], '성별을 선택해 주세요.')
        .required('성별은 필수 선택 사항입니다.'),
}).required();

// 회원가입 폼 데이터 타입 추론
type RegisterFormData = yup.InferType<typeof RegisterSchema>;

interface InputFieldProps {
    label: string;
    name: keyof RegisterFormData;
    type?: string;
    placeholder?: string;
    disabled: boolean;
    errors: FieldErrors<RegisterFormData>;
    register: UseFormRegister<RegisterFormData>;
}

const InputField: React.FC<InputFieldProps> = ({ 
    label, 
    name, 
    type = 'text', 
    placeholder, 
    errors, 
    register, 
    ...rest 
}) => (
    <div className="flex items-center space-x-4">
        <label htmlFor={name} className="flex-shrink-0 w-24 text-sm font-medium text-gray-700">
            {label}
        </label>
        <div className="flex-1">
            <input
                id={name}
                type={type}
                placeholder={placeholder}
                {...register(name)}
                className={`w-full px-3 py-2 border ${errors[name] ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                {...rest}
            />
            {errors[name] && <p className="mt-1 text-xs text-red-500">{errors[name]?.message}</p>}
        </div>
    </div>
);

// 이메일 중복체크 타입 정의
type EmailCheckStatus = 'idle' | 'checking' | 'available' | 'duplicate' | 'error';

// Mockup error 객체 타입 정의
interface MockError {
    response: {
        status: number;
        data: { message: string }
    };
}

// error가 MockError type인지 확인하는 type guard function
function isMockError(error: unknown): error is MockError {
    if (typeof error !== 'object' || error === null || !('response' in error)) {
        return false;
    }
    const response = (error as MockError).response;

    if (typeof response !== 'object' || response === null || !('data' in response) || !('status' in response)) {
        return false;
    }

    const data = response.data;
    return (
        typeof data === 'object' && 
        data !== null && 
        'message' in data && 
        typeof data.message === 'string'
    );    
}

const SignUp: React.FC = () => {
    const navigate = useNavigate();
    // const { login } = useAuth(); 

    // API 상태 관리
    const [isSubmitting, setIsSubmitting] = useState(false);

    // 이메일 중복 확인 상태 관리 추가
    const [emailCheckStatus, setEmailCheckStatus] = useState<EmailCheckStatus>('idle');
    const [emailCheckMessage, setEmailCheckMessage] = useState<string | null>(null);    

    // useForm 초기화, yupResolver 적용
    const { 
        register, 
        handleSubmit, 
        formState: { errors },
        getValues,
        trigger 
    } = useForm<RegisterFormData>({
        resolver: yupResolver(RegisterSchema),
        mode: 'onSubmit'
    });

    // 이메일 중복 확인 함수
    const checkEmailDuplication = useCallback(async () => {
        const email = getValues('email');
        
        // 이메일 필드의 유효성 검사만 수동으로 실행
        const isEmailValid = await trigger('email');
        if (!isEmailValid) {
            setEmailCheckMessage('유효한 이메일 형식을 먼저 입력해주세요.');
            setEmailCheckStatus('error');
            return;
        }

        setEmailCheckStatus('checking');
        setEmailCheckMessage('이메일 중복 확인 중...');

        try {
            const response = await axios.post('/api/checkEmailDup', { email });

            console.log("확인: " + response.data);

            // 중복 확인 Mockup (예: 'duplicate@test.com'은 중복으로 간주)
            await new Promise(resolve => setTimeout(resolve, 800));

            setEmailCheckStatus('available');
            setEmailCheckMessage('✅ 사용 가능한 이메일입니다.');

        } catch (error) {
            console.error('Email duplication check failed', error);
            setEmailCheckStatus('duplicate');
            
            if (axios.isAxiosError(error) && error.response) {
                const status = error.response.status;
                const result = error.response.data as { message?: string };
                
                if (status === 409) {
                    setEmailCheckMessage(result.message || '이미 사용 중인 이메일입니다.');
                } else {
                    setEmailCheckMessage(result.message || `이메일 확인 중 서버 오류가 발생했습니다. (HTTP ${status})`);
                }
            } else if (isMockError(error)) {
                // 2. Mockup 에러 처리 (타입 가드를 사용하여 안전하게 접근)
                if (error.response.status === 409) {
                     setEmailCheckMessage(error.response.data.message); // <-- 'any' 캐스팅 없이 안전하게 접근!
                } else {
                    setEmailCheckMessage('알 수 없는 서버 응답 오류가 발생했습니다.');
                }
            } else {
                // 3. 기타 일반적인 네트워크 오류 처리
                setEmailCheckMessage('네트워크 오류로 중복 확인에 실패했습니다.');
            }
        }
    }, [getValues, trigger]);    

    // 유효성 검증 통과 시 실행
    const onSubmit: SubmitHandler<RegisterFormData> = async (data) => {
        // 이메일 중복 확인이 완료되지 않았거나 중복 상태인 경우 제출을 막음
        if (emailCheckStatus !== 'available') {
            setEmailCheckMessage('이메일 중복 확인을 완료하거나, 사용 가능한 이메일로 수정해 주세요.');
            return;
        }

        console.log('회원가입 요청 데이터:', data);
        setIsSubmitting(true);

        // registration API 호출 (mockup)
        try {
            // NOTE: 실제 spring boot 서버로 axios post 요청 코드가 들어갈 위치
            // const res = await axios.post('api/register', data);
            
            // 성공 시뮬레이션
            await new Promise(resolve => setTimeout(resolve, 1500));
            
            // 서버 응답 시뮬레이션
            // const res = { status: 201, data: { message: '회원가입이 성공적으로 완료되었습니다.' } };

            const successMessage = '회원가입이 성공적으로 완료되었습니다. 로그인 페이지로 이동합니다.';
            console.log('회원가입 성공', successMessage);

            // 회원가입 성공 후 로그인 페이지로 이동 (2초 후)
            setTimeout(() => {
                // navigate('/login')
                console.log('Redirecting to /login');
            }, 2000);
            
        } catch (error) {
            console.error('회원가입 실패', error);
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 p-4">
            <div className="w-full max-w-lg bg-white p-8 rounded-xl shadow-2xl space-y-6">

                {/* 뒤로가기 버튼 & 타이틀 */}
                <div className="relative">
                    <button
                        onClick={() => navigate('/login')} 
                        className="absolute left-0 top-1/2 -translate-y-1/2 text-gray-500 hover:text-red-600 p-1 transition duration-150"
                        aria-label="로그인 페이지로 돌아가기" 
                        disabled={isSubmitting}
                    >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
                    </button>
                    <h2 className="text-3xl font-bold text-center text-red-600">회원가입</h2>
                </div>

                <p className="text-center text-gray-500">맛집 탐방을 위한 새로운 계정을 만들어보세요.</p>

                {/* 회원가입 폼 */}
                <form className="space-y-5" onSubmit={handleSubmit(onSubmit)} noValidate>
                    
                    {/* --------------------------- 이메일 필드 (중복 확인 포함) --------------------------- */}
                    <div className="flex items-center space-x-4">
                        <label htmlFor="email" className="flex-shrink-0 w-24 text-sm font-medium text-gray-700">
                            이메일
                        </label>
                        <div className="flex-1 flex space-x-2">
                            <input
                                id="email"
                                type="email"
                                placeholder="youremail@gmail.com"
                                {...register('email', {
                                    // 값이 변경될 때마다 중복 상태 초기화
                                    onChange: () => {
                                        setEmailCheckStatus('idle');
                                        setEmailCheckMessage(null);
                                    }
                                })}
                                disabled={isSubmitting || emailCheckStatus === 'checking'}
                                className={`flex-1 px-3 py-2 border ${errors.email ? 'border-red-500' : 'border-gray-300'} placeholder-gray-500 text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm 
                                    ${emailCheckStatus === 'available' ? 'border-green-500 ring-green-500' : ''}
                                    ${emailCheckStatus === 'duplicate' ? 'border-red-500 ring-red-500' : ''}
                                `}
                            />
                            
                            <button
                                type="button"
                                onClick={checkEmailDuplication}
                                // 이메일 에러가 있거나, 이미 확인 중이거나, 제출 중이면 비활성화
                                disabled={isSubmitting || emailCheckStatus === 'checking' || errors.email !== undefined}
                                className={`
                                    w-24 text-sm font-medium py-2 rounded-lg transition duration-150 
                                    ${(emailCheckStatus === 'checking' || errors.email)
                                        ? 'bg-gray-300 text-gray-600 cursor-not-allowed'
                                        : 'bg-red-500 hover:bg-red-600 text-white shadow-md'
                                    }
                                `}
                            >
                                {emailCheckStatus === 'checking' ? '확인 중' : '중복 확인'}
                            </button>
                        </div>
                    </div>
                    
                    {/* 이메일 오류 및 중복 확인 메시지 출력 */}
                    <div className="ml-28 -mt-3">
                        {errors.email && <p className="mt-1 text-xs text-red-500">{errors.email.message}</p>}
                        {/* 중복 확인 관련 메시지 출력 */}
                        {emailCheckMessage && !errors.email && (
                            <p className={`mt-1 text-xs ${emailCheckStatus === 'available' ? 'text-green-600' : 'text-red-500'}`}>
                                {emailCheckMessage}
                            </p>
                        )}
                    </div>
                    {/* --------------------------------------------------------------------------------- */}

                    {/* 비밀번호 (Input) */}
                    <InputField 
                        label="비밀번호" 
                        name="password" 
                        type="password" 
                        placeholder="최소 8자 이상" 
                        disabled={isSubmitting}
                        errors={errors}
                        register={register}
                    />

                    {/* 이름 (Input) */}
                    <InputField 
                        label="이름" 
                        name="name" 
                        type="text" 
                        placeholder="닉네임으로 사용될 이름" 
                        disabled={isSubmitting}
                        errors={errors}
                        register={register}
                    />
                    
                    {/* 생년월일 (Input type="date") */}
                    <div className="flex items-center space-x-4">
                        <label htmlFor="birthDate" className="flex-shrink-0 w-24 text-sm font-medium text-gray-700">
                            생년월일
                        </label>
                        <div className="flex-1">
                            <input
                                id="birthDate"
                                type="date"
                                {...register('birthDate')}
                                max={new Date().toISOString().split('T')[0]}
                                disabled={isSubmitting}
                                className={`w-full px-3 py-2 border ${errors.birthDate ? 'border-red-500' : 'border-gray-300'} text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:border-red-500 sm:text-sm`}
                            />
                            {errors.birthDate && <p className="mt-1 text-xs text-red-500">{errors.birthDate.message}</p>}
                        </div>
                    </div>

                    {/* 성별 (Radio Group) */}
                    <div className="flex items-start space-x-4">
                        <span className="flex-shrink-0 w-24 text-sm font-medium text-gray-700 pt-2">성별</span>
                        <div className="flex space-x-6 pt-2 flex-1">
                            {/* 남자 */}
                            <label className="inline-flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    {...register('gender')}
                                    value="MALE"
                                    disabled={isSubmitting}
                                    className="form-radio h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
                                />
                                <span className="ml-2 text-gray-700">남성</span>
                            </label>
                            {/* 여자 */}
                            <label className="inline-flex items-center cursor-pointer">
                                <input
                                    type="radio"
                                    {...register('gender')}
                                    value="FEMALE"
                                    disabled={isSubmitting}
                                    className="form-radio h-4 w-4 text-red-600 border-gray-300 focus:ring-red-500"
                                />
                                <span className="ml-2 text-gray-700">여성</span>
                            </label>
                        </div>
                        {errors.gender && <p className="mt-1 text-xs text-red-500 w-full absolute -bottom-5 left-28">{errors.gender.message}</p>}
                    </div>

                    {/* 회원가입 버튼 */}
                    <button
                        type="submit"
                        // 이메일 중복 확인 상태가 'available'이 아니면 버튼 비활성화
                        disabled={isSubmitting}
                        className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-lg font-bold rounded-lg text-white transition duration-150 transform bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 hover:scale-[1.01]'"
                    >
                        {isSubmitting ? (
                            <div className="flex items-center">
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                회원가입 중...
                            </div>
                        ) : '회원가입 완료'}
                    </button>
                </form>
            </div>
        </div>
    );
}

export default SignUp;
