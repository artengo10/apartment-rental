'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface User {
    id: number;
    email: string;
    name: string;
    phone: string;
    role: 'TENANT' | 'LANDLORD';
    isVerified: boolean;
}

interface AuthContextType {
    user: User | null;
    login: (email: string, password: string) => Promise<boolean>;
    register: (userData: RegisterData) => Promise<boolean>;
    verifyCode: (email: string, code: string) => Promise<boolean>;
    logout: () => void;
    isLoading: boolean;
}

interface RegisterData {
    name: string;
    email: string;
    phone: string;
    password: string;
    role: 'TENANT' | 'LANDLORD';
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        checkAuth();
    }, []);

    const checkAuth = async () => {
        if (!isClient) return;

        try {
            const token = localStorage.getItem('auth_token');
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
            } else {
                localStorage.removeItem('auth_token');
            }
        } catch (error) {
            console.error('Auth check failed:', error);
            localStorage.removeItem('auth_token');
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
                localStorage.setItem('auth_token', token);
                setUser(userData);
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
                localStorage.setItem('auth_token', token);
                setUser(userData);
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
        localStorage.removeItem('auth_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{
            user,
            login,
            register,
            verifyCode,
            logout,
            isLoading
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
