import { useMemo, useState, type ReactNode } from "react";
import type { User } from "./AuthTypes";
import { AuthContext } from "./AuthContext";

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    
    const [user, setUser] = useState<User | null>(() => {
        const storedUser = localStorage.getItem('user');
        return storedUser ? JSON.parse(storedUser) : null;
    });

    const isLoggedIn = !!user;

    // 로그인 함수: 사용자 정보와 토큰 저장
    const login = (userData: User, token: string) => {
        localStorage.setItem('user', JSON.stringify(userData));
        localStorage.setItem('token', token); 
        setUser(userData);
    };

    // 로그아웃 함수: 저장된 정보 삭제
    const logout = () => {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        setUser(null);
    };

    // Context Value를 useMemo로 감싸 성능 최적화
    const value = useMemo(() => ({
        user,
        isLoggedIn,
        login,
        logout
    }), [user, isLoggedIn]);

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
};