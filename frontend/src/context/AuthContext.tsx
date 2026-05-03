import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { api } from '../api/client';

interface User {
    userId: string;
    username: string;
}

interface AuthContextType {
    user: User | null;
    login: (username: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (username: string, password: string) => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    // Load user from localStorage on mount
    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch (e) {
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    const login = async (username: string, password: string) => {
        const result = await api.login(username, password);
        console.log('Login API result:', result);
        console.log('result.success:', result.success);
        console.log('result.user:', result.user);
        if (result.success && result.user) {
            const userData = {
                userId: result.user.user_id,
                username: result.user.username
            };
            console.log('Setting user data:', userData);
            setUser(userData);
            localStorage.setItem('user', JSON.stringify(userData));
        } else {
            console.error('Login failed - success:', result.success, 'user:', result.user);
            throw new Error(result.message || 'ログインに失敗しました');
        }
    };

    const logout = async () => {
        await api.logout();
        setUser(null);
        localStorage.removeItem('user');
    };

    const register = async (username: string, password: string) => {
        const result = await api.register(username, password);
        if (result.success) {
            // Auto-login after registration
            await login(username, password);
        } else {
            throw new Error(result.message || '登録に失敗しました');
        }
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
