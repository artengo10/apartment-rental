// components/Header.tsx
'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import LoginModal from './modals/LoginModal';
import RegisterModal from './modals/RegisterModal';
import ForgotPasswordModal from './modals/ForgotPasswordModal';
import AddApartmentModal from './modals/AddApartmentWizard';
import { Plus, User as UserIcon } from 'lucide-react';

export default function Header() {
    const { user, logout } = useAuth();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
    const [showAddApartmentModal, setShowAddApartmentModal] = useState(false);

    const getDisplayName = (fullName: string): string => {
        const nameParts = fullName.trim().split(/\s+/).filter(part => part.length > 0);
        if (nameParts.length >= 2) {
            return nameParts.slice(1).join(' ');
        }
        return nameParts[0] || 'Пользователь';
    };

    return (
        <>
            {/* ФИКСИРОВАННЫЙ Header */}
            <header className="fixed top-0 left-0 right-0 z-50 bg-primary text-white shadow-sm border-b border-black h-14">
                <div className="container mx-auto h-full px-4">
                    <div className="flex justify-between items-center h-full">
                        <Link
                            href="/results"
                            className="text-left hover:opacity-80 transition-opacity"
                        >
                            <h1 className="text-lg font-bold">СъёмБронь</h1>
                        </Link>

                        <nav className="flex items-center gap-3">
                            {user ? (
                                <>
                                    {/* Десктопная кнопка добавления жилья */}
                                    <button
                                        onClick={() => setShowAddApartmentModal(true)}
                                        className="hidden md:flex bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md font-medium transition-colors text-sm items-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" />
                                        <span>Добавить жилье</span>
                                    </button>

                                    {/* Приветствие - только на десктопе */}
                                    <div className="hidden md:block">
                                        <p className="text-sm font-medium">
                                            Привет, {getDisplayName(user.name)}!
                                        </p>
                                    </div>

                                    {/* Иконка профиля - и на мобиле и на десктопе */}
                                    <Link
                                        href="/profile"
                                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                                    >
                                        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                                            <UserIcon className="w-4 h-4" />
                                        </div>
                                        <span className="hidden lg:inline text-sm">
                                            {getDisplayName(user.name)}
                                        </span>
                                    </Link>
                                </>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowLoginModal(true)}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md font-medium transition-colors text-sm"
                                    >
                                        Войти
                                    </button>
                                    <button
                                        onClick={() => setShowRegisterModal(true)}
                                        className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md font-medium transition-colors text-sm"
                                    >
                                        Регистрация
                                    </button>
                                </div>
                            )}
                        </nav>
                    </div>
                </div>
            </header>

            {/* Модальные окна */}
            <LoginModal
                isOpen={showLoginModal}
                onClose={() => setShowLoginModal(false)}
                onSwitchToRegister={() => {
                    setShowLoginModal(false);
                    setShowRegisterModal(true);
                }}
                onForgotPassword={() => {
                    setShowLoginModal(false);
                    setShowForgotPasswordModal(true);
                }}
            />
            <RegisterModal
                isOpen={showRegisterModal}
                onClose={() => setShowRegisterModal(false)}
                onSwitchToLogin={() => {
                    setShowRegisterModal(false);
                    setShowLoginModal(true);
                }}
            />
            <ForgotPasswordModal
                isOpen={showForgotPasswordModal}
                onClose={() => setShowForgotPasswordModal(false)}
                onSwitchToLogin={() => {
                    setShowForgotPasswordModal(false);
                    setShowLoginModal(true);
                }}
            />
            <AddApartmentModal
                isOpen={showAddApartmentModal}
                onClose={() => setShowAddApartmentModal(false)}
                onSuccess={() => {
                    console.log('Жилье успешно добавлено!');
                }}
            />
        </>
    );
}
