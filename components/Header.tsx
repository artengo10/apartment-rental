'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import LoginModal from './modals/LoginModal';
import RegisterModal from './modals/RegisterModal';
import ForgotPasswordModal from './modals/ForgotPasswordModal';
import AddApartmentModal from './modals/AddApartmentWizard';
import { User as UserIcon, Plus } from 'lucide-react';

export default function Header() {
    const { user, logout } = useAuth();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
    const [showAddApartmentModal, setShowAddApartmentModal] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        const handleScroll = () => {
            setScrolled(window.scrollY > 10);
        };

        window.addEventListener('scroll', handleScroll);

        return () => {
            window.removeEventListener('resize', checkMobile);
            window.removeEventListener('scroll', handleScroll);
        };
    }, []);

    const getDisplayName = (fullName: string): string => {
        const nameParts = fullName.trim().split(/\s+/).filter(part => part.length > 0);
        if (nameParts.length >= 2) {
            // Возвращаем только имя (первое слово) и отчество (второе слово)
            return `${nameParts[0]} ${nameParts[1]}`;
        }
        return nameParts[0] || 'Пользователь';
    };

    const handleLogout = () => {
        logout();
    };

    return (
        <>
            <header className={`fixed top-0 left-0 right-0 z-40 bg-blue-600 text-white h-14 transition-all duration-300 ${scrolled ? 'shadow-lg' : ''}`}>
                <div className="container mx-auto h-full px-4">
                    <div className="flex justify-between items-center h-full">
                        {/* Логотип */}
                        <Link
                            href="/results"
                            className="flex items-center hover:opacity-80 transition-opacity"
                        >
                            <h1 className="text-lg font-bold tracking-tight">СъёмБронь</h1>
                        </Link>

                        {/* Правая часть */}
                        <nav className="flex items-center gap-2 md:gap-3">
                            {user ? (
                                <>
                                   

                                    {/* Приветствие - только на десктопах */}
                                    <div className="hidden md:block">
                                        <p className="text-sm font-medium">
                                            Привет, {getDisplayName(user.name)}!
                                        </p>
                                    </div>

                                    {/* Иконка профиля - всегда видна */}
                                    <Link
                                        href="/profile"
                                        className="flex items-center gap-2 hover:opacity-80 transition-opacity"
                                        title="Профиль"
                                    >
                                        <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center border-2 border-white/30">
                                            <UserIcon className="w-4 h-4" />
                                        </div>
                                        {/* Имя рядом с иконкой - только на десктопах */}
                                        <span className="hidden lg:inline text-sm ml-1">
                                            {getDisplayName(user.name)}
                                        </span>
                                    </Link>
                                </>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={() => setShowLoginModal(true)}
                                        className="bg-blue-700 hover:bg-blue-800 text-white px-3 py-1.5 rounded-md font-medium transition-colors text-sm"
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
