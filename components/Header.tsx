'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import LoginModal from './modals/LoginModal';
import RegisterModal from './modals/RegisterModal';
import ForgotPasswordModal from './modals/ForgotPasswordModal';
import AddApartmentModal from './modals/AddApartmentWizard';
import { User as UserIcon, Plus, Heart, MessageCircle, Home } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';

export default function Header() {
    const { user, logout } = useAuth();
    const { favoriteIds } = useFavorites();
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
            return `${nameParts[0]} ${nameParts[1]}`;
        }
        return nameParts[0] || 'Пользователь';
    };

    const handleLogout = () => {
        logout();
    };

    return (
        <>
            <header className={`fixed top-0 left-0 right-0 z-[100] bg-blue-600 text-white h-14 transition-all duration-300 ${scrolled ? 'shadow-lg' : ''}`}>                <div className="container mx-auto h-full px-4">
                    <div className="flex justify-between items-center h-full">
                        {/* Логотип */}
                        <Link
                            href="/results"
                            className="flex items-center hover:opacity-80 transition-opacity"
                        >
                            <h1 className="text-lg font-bold tracking-tight">СъёмБронь</h1>
                        </Link>

                        {/* Мобильная навигация */}
                        {isMobile ? (
                            <div className="flex items-center gap-2">
                                {/* ИЗБРАННОЕ */}
                                {user ? (
                                    <Link
                                        href="/favorites"
                                        className="relative flex items-center justify-center hover:opacity-80 transition-opacity p-2"
                                        title="Избранное"
                                    >
                                        <Heart className="w-5 h-5" />
                                        {favoriteIds.length > 0 && (
                                            <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center">
                                                {favoriteIds.length > 9 ? '9+' : favoriteIds.length}
                                            </span>
                                        )}
                                    </Link>
                                ) : (
                                    <button
                                        onClick={() => setShowLoginModal(true)}
                                        className="flex items-center justify-center hover:opacity-80 transition-opacity p-2"
                                        title="Избранное"
                                    >
                                        <Heart className="w-5 h-5" />
                                    </button>
                                )}

                                {/* ЧАТЫ */}
                                {user ? (
                                    <Link
                                        href="/chats"
                                        className="flex items-center justify-center hover:opacity-80 transition-opacity p-2"
                                        title="Чаты"
                                    >
                                        <MessageCircle className="w-5 h-5" />
                                    </Link>
                                ) : (
                                    <button
                                        onClick={() => setShowLoginModal(true)}
                                        className="flex items-center justify-center hover:opacity-80 transition-opacity p-2"
                                        title="Чаты"
                                    >
                                        <MessageCircle className="w-5 h-5" />
                                    </button>
                                )}

                            {/* ДОМ + ДОБАВИТЬ - ОБЪЕДИНЕННАЯ ИКОНКА */}
                            <div className="relative group">
                                <button
                                    onClick={() => {
                                        if (user) {
                                            setShowAddApartmentModal(true);
                                            // Блокируем скролл body
                                            document.body.classList.add('modal-open');
                                        } else {
                                            setShowLoginModal(true);
                                        }
                                    }}
                                    className="flex items-center justify-center hover:opacity-80 transition-opacity p-2"
                                    title="Добавить жилье"
                                >
                                    <div className="relative">
                                        <Home className="w-6 h-6" />
                                        <Plus className="absolute -top-1 -right-1 w-3 h-3 bg-white text-blue-600 rounded-full p-0.5" />
                                    </div>
                                </button>
                                {/* Подсказка при наведении */}
                                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 bg-gray-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                                    Добавить жилье
                                </div>
                            </div>

                                {/* ПРОФИЛЬ */}
                                {user ? (
                                    <Link
                                        href="/profile"
                                        className="flex items-center justify-center hover:opacity-80 transition-opacity p-2"
                                        title="Профиль"
                                    >
                                        <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center border-2 border-white/30">
                                            <UserIcon className="w-4 h-4" />
                                        </div>
                                    </Link>
                                ) : (
                                    <button
                                        onClick={() => setShowLoginModal(true)}
                                        className="flex items-center justify-center hover:opacity-80 transition-opacity p-2"
                                        title="Профиль"
                                    >
                                        <div className="w-8 h-8 bg-blue-700 rounded-full flex items-center justify-center border-2 border-white/30">
                                            <UserIcon className="w-4 h-4" />
                                        </div>
                                    </button>
                                )}
                            </div>
                        ) : (
                            /* Десктопная навигация (старая версия) */
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
                        )}
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
