import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // 앱 실행 시 세션 상태 확인
    useEffect(() => {
        const checkLoginStatus = async () => {
            try {
                // 서버에 현재 세션 유저 정보를 묻는 API 호출 (가정)
                const response = await axios.get('http://localhost:8080/api/data/user/session');
                if (response.data) {
                    setUser(response.data);
                }
            } catch (error) {
                setUser(null);
            } finally {
                setLoading(false);
            }
        };
        checkLoginStatus();
    }, []);

    const login = (userData) => {
        setUser(userData);
        // 보안을 위해 sessionStorage에 최소 정보 저장 가능
        sessionStorage.setItem('isLoggedIn', 'true');
    };

    const logout = async () => {
        try {
            await axios.post('http://localhost:8080/api/data/user/logout');
        } finally {
            setUser(null);
            sessionStorage.clear();
            window.location.href = '/';
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);