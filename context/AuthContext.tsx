// context/AuthContext.tsx - ИСПРАВЛЕННАЯ ВЕРСИЯ
'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    id: number;
    email: string;
    name: string;
    phone: string;
    isVerified: boolean;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    register: (userData: RegisterData) => Promise<boolean>;
    verifyCode: (email: string, code: string) => Promise<boolean>;
    logout: () => void;
    isLoading: boolean;
    updateUser: (userData: User) => void; // НОВАЯ ФУНКЦИЯ
}

interface RegisterData {
    name: string;
    email: string;
    phone: string;
    password: string;
}

// Ключи для localStorage
const AUTH_TOKEN_KEY = 'auth_token';
const USER_DATA_KEY = 'user_data';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isClient, setIsClient] = useState(false);

    // Функция для сохранения пользователя в localStorage
    const saveUserToStorage = (userData: User) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(USER_DATA_KEY, JSON.stringify(userData));
        }
    };

    // Функция для загрузки пользователя из localStorage
    const loadUserFromStorage = (): User | null => {
        if (typeof window !== 'undefined') {
            const userData = localStorage.getItem(USER_DATA_KEY);
            return userData ? JSON.parse(userData) : null;
        }
        return null;
    };

    // Функция для удаления пользователя из localStorage
    const removeUserFromStorage = () => {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(USER_DATA_KEY);
            localStorage.removeItem(AUTH_TOKEN_KEY);
        }
    };

    // НОВАЯ ФУНКЦИЯ: Обновление данных пользователя
    const updateUser = (userData: User) => {
        setUser(userData);
        saveUserToStorage(userData);
    };

    useEffect(() => {
        setIsClient(true);

        // Сначала загружаем пользователя из localStorage для мгновенного отображения
        const savedUser = loadUserFromStorage();
        if (savedUser) {
            setUser(savedUser);
        }

        // Затем проверяем актуальность токена
        checkAuth();
    }, []);

    const checkAuth = async () => {
        if (!isClient) {
            setIsLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem(AUTH_TOKEN_KEY);

            if (!token) {
                setIsLoading(false);
                return;
            }

            const response = await fetch('/api/auth/verify', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
                saveUserToStorage(userData);
            } else {
                console.log('❌ Token invalid, removing from storage');
                removeUserFromStorage();
            }
        } catch (error) {
            console.error('❌ Auth check failed:', error);
            removeUserFromStorage();
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string): Promise<boolean> => {
        try {
            const response = await fetch('/api/auth/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, password }),
            });

            if (response.ok) {
                const { token, user: userData } = await response.json();

                // ВАЖНО: Сохраняем токен в localStorage
                localStorage.setItem(AUTH_TOKEN_KEY, token);
                setUser(userData);
                saveUserToStorage(userData);
                return true;
            } else {
                const errorData = await response.json();
                console.error('Login failed:', errorData.error);
                return false;
            }
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    };

    const register = async (userData: RegisterData): Promise<boolean> => {
        try {
            const response = await fetch('/api/auth/register', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(userData),
            });

            if (response.ok) {
                return true;
            } else {
                const errorData = await response.json();
                console.error('Registration failed:', errorData.error);
                return false;
            }
        } catch (error) {
            console.error('Registration error:', error);
            return false;
        }
    };

    const verifyCode = async (email: string, code: string): Promise<boolean> => {
        try {
            const response = await fetch('/api/auth/verify-code', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email, code }),
            });

            if (response.ok) {
                const { token, user: userData } = await response.json();

                // ВАЖНО: Сохраняем токен в localStorage
                localStorage.setItem(AUTH_TOKEN_KEY, token);
                setUser(userData);
                saveUserToStorage(userData);
                return true;
            } else {
                const errorData = await response.json();
                console.error('Verification failed:', errorData.error);
                return false;
            }
        } catch (error) {
            console.error('Verification error:', error);
            return false;
        }
    };

    const logout = () => {
        removeUserFromStorage();
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            register,
            verifyCode,
            logout,
            isLoading,
            updateUser
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}
