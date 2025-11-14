// 회원가입, 로그인 등 사용자 관련 인터페이스, 타입 정의
import { type FieldErrors, type UseFormRegister } from "react-hook-form";

// 회원가입폼 
export interface RegisterFormData {
    email: string;
    password: string;
    name: string;
    birthDate: string;
    gender: 'MALE' | 'FEMALE' | 'OTHER';
}

export interface SignUpInputFieldProps {
    label: string;
    name: keyof RegisterFormData;
    type?: string;
    placeholder?: string;
    disabled: boolean;
    errors: FieldErrors<RegisterFormData>;
    register: UseFormRegister<RegisterFormData>;
    firstErrorKey: keyof RegisterFormData | undefined;
}

// 이메일 중복 체크 상태 타입
export type EmailCheckStatus = 'idle' | 'checking' | 'available' | 'duplicate' | 'error';

// Mockup 에러 객체 인터페이스
export interface MockError {
    response: {
        status: number;
        data: { message: string }
    };
}