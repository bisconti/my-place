// 사용자 정보 타입 정의
export interface User {
    useremail: string;
    username: string;
}

// Context에서 제공할 값들의 type 정의
export interface AuthContextType {
    user: User | null;
    isLoggedIn: boolean;
    login: (userData: User, token: string) => void;
    logout: () => void;
}