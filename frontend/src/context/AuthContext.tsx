import React, { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import { api } from '../api/client';

interface User {
    userId: string;
    username: string;
}

interface AuthContextType {
    user: User | null;
    login: (userId: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    register: (userId: string, username: string, password: string) => Promise<void>;
    updateProfile: (username: string, currentPassword: string, newPassword: string) => Promise<void>;
    loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

/**
 * Provide typed access to the authentication context.
 */
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

/**
 * Keep authentication state synchronized between the API response and local storage.
 */
export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            try {
                setUser(JSON.parse(storedUser));
            } catch {
                localStorage.removeItem('user');
            }
        }
        setLoading(false);
    }, []);

    /**
     * Store the current user in React state and browser storage.
     */
    const persistUser = (userData: User) => {
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
    };

    /**
     * Log in with the immutable user ID and persist the returned display username.
     */
    const login = async (userId: string, password: string) => {
        const result = await api.login(userId, password);
        if (result.success && result.user) {
            persistUser({
                userId: result.user.user_id,
                username: result.user.username
            });
            return;
        }

        throw new Error(result.error || result.message || 'ログインに失敗しました');
    };

    /**
     * Log out from the API and clear locally cached user information.
     */
    const logout = async () => {
        await api.logout();
        setUser(null);
        localStorage.removeItem('user');
    };

    /**
     * Register with a login user ID and display username, then log in immediately.
     */
    const register = async (userId: string, username: string, password: string) => {
        const result = await api.register(userId, username, password);
        if (result.success) {
            await login(userId, password);
            return;
        }

        throw new Error(result.error || result.message || '登録に失敗しました');
    };

    /**
     * Update editable profile fields and refresh the cached display username.
     */
    const updateProfile = async (username: string, currentPassword: string, newPassword: string) => {
        const result = await api.updateProfile(username, currentPassword, newPassword);
        if (result.success && result.user) {
            persistUser({
                userId: result.user.user_id,
                username: result.user.username
            });
            return;
        }

        throw new Error(result.error || result.message || 'ユーザー情報の更新に失敗しました');
    };

    return (
        <AuthContext.Provider value={{ user, login, logout, register, updateProfile, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
