// components/Sidebar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Heart, MessageCircle, User, Plus, LogOut } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import LoginModal from './modals/LoginModal';
import RegisterModal from './modals/RegisterModal';
import ForgotPasswordModal from './modals/ForgotPasswordModal';
import AddApartmentModal from './modals/AddApartmentWizard';

const Sidebar = () => {
    const pathname = usePathname();
    const { favoriteIds } = useFavorites();
    const { user, logout } = useAuth();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
    const [showAddApartmentModal, setShowAddApartmentModal] = useState(false);

    const handleLogout = () => {
        logout();
        localStorage.removeItem('favorite_ids');
    };

    const getDisplayName = (fullName: string): string => {
        const nameParts = fullName.trim().split(/\s+/).filter(part => part.length > 0);
        if (nameParts.length >= 2) {
            return nameParts.slice(1).join(' ');
        }
        return nameParts[0] || 'Пользователь';
    };

    const navItems = [
        {
            name: 'Главная',
            href: '/results',
            icon: Home,
            active: pathname === '/results' || pathname === '/'
        },
        {
            name: 'Избранное',
            href: user ? '/favorites' : '#',
            icon: Heart,
            active: pathname === '/favorites',
            badge: favoriteIds.length > 0 ? favoriteIds.length : null,
            onClick: !user ? (e: React.MouseEvent) => {
                e.preventDefault();
                setShowLoginModal(true);
            } : undefined
        },
        {
            name: 'Добавить жилье',
            href: user ? '#' : '#',
            icon: Plus,
            active: false,
            onClick: user ? () => {
                setShowAddApartmentModal(true);
            } : (e: React.MouseEvent) => {
                e.preventDefault();
                setShowLoginModal(true);
            }
        },
        {
            name: 'Чаты',
            href: user ? '/chats' : '#',
            icon: MessageCircle,
            active: pathname.startsWith('/chats'),
            onClick: !user ? (e: React.MouseEvent) => {
                e.preventDefault();
                setShowLoginModal(true);
            } : undefined
        },
        {
            name: 'Профиль',
            href: user ? '/profile' : '#',
            icon: User,
            active: pathname.startsWith('/profile'),
            onClick: !user ? (e: React.MouseEvent) => {
                e.preventDefault();
                setShowLoginModal(true);
            } : undefined
        }
    ];

    return (
        <>
            <div className="hidden lg:flex flex-col w-65 bg-white border-r border-gray-300 h-[calc(100vh-56px)] fixed left-0 top-14 z-40">
                {/* Профиль пользователя вверху */}
                {user ? (
                    <div className="p-3 border-b border-gray-200">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
                                <User className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <p className="font-medium text-sm">{getDisplayName(user.name)}</p>
                                <p className="text-xs text-gray-500 truncate">{user.email}</p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="p-4 border-b border-gray-200">
                        <p className="text-sm text-gray-600 mb-2">Вы не авторизованы</p>
                        <div className="flex flex-col gap-2">
                            <button
                                onClick={() => setShowLoginModal(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                            >
                                Войти
                            </button>
                            <button
                                onClick={() => setShowRegisterModal(true)}
                                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded text-sm font-medium transition-colors"
                            >
                                Регистрация
                            </button>
                        </div>
                    </div>
                )}

                {/* Навигация */}
                <nav className="flex-1 p-3">
                    <ul className="space-y-1">
                        {navItems.map((item) => {
                            const content = (
                                <>
                                    <div className="flex items-center gap-5">
                                        <div className="relative">
                                            <item.icon className={`w-5 h-5 ${item.active ? 'text-blue-600' : 'text-gray-600'}`} />
                                            {item.badge && item.badge > 0 && (
                                                <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-xs flex items-center justify-center">
                                                    {item.badge}
                                                </span>
                                            )}
                                        </div>
                                        <span className={`${item.active ? 'text-blue-600 font-medium' : 'text-gray-700'}`}>
                                            {item.name}
                                        </span>
                                    </div>
                                </>
                            );

                            if (item.onClick) {
                                return (
                                    <li key={item.name}>
                                        <button
                                            onClick={item.onClick}
                                            className={`w-full text-left px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors ${item.active ? 'bg-blue-50' : ''}`}
                                        >
                                            {content}
                                        </button>
                                    </li>
                                );
                            }

                            return (
                                <li key={item.name}>
                                    <Link
                                        href={item.href}
                                        className={`block px-3 py-2.5 rounded-lg hover:bg-gray-100 transition-colors ${item.active ? 'bg-blue-50' : ''}`}
                                    >
                                        {content}
                                    </Link>
                                </li>
                            );
                        })}
                    </ul>
                </nav>

                {/* Выход (только для авторизованных) */}
                {user && (
                    <div className="p-4 border-t border-gray-200">
                        <button
                            onClick={handleLogout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                            <LogOut className="w-5 h-5" />
                            <span>Выйти</span>
                        </button>
                    </div>
                )}
            </div>

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
};

export default Sidebar;