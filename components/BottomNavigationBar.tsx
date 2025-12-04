// components/BottomNavigationBar.tsx
'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Heart, MessageCircle, User, Plus } from 'lucide-react';
import { useFavorites } from '@/hooks/useFavorites';
import { useAuth } from '@/context/AuthContext';
import { useState } from 'react';
import LoginModal from './modals/LoginModal';
import RegisterModal from './modals/RegisterModal';
import ForgotPasswordModal from './modals/ForgotPasswordModal';
import AddApartmentModal from './modals/AddApartmentWizard';

const BottomNavigationBar = () => {
    const pathname = usePathname();
    const { favoriteIds } = useFavorites();
    const { user } = useAuth();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
    const [showAddApartmentModal, setShowAddApartmentModal] = useState(false);

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
            name: 'Добавить',
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
            {/* ФИКСИРОВАННАЯ нижняя навигация */}
            <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-300 z-50 md:hidden">
                <div className="flex justify-around items-center h-14">
                    {navItems.map((item) => {
                        const content = (
                            <>
                                <div className="relative">
                                    <item.icon className={`h-5 w-5 ${item.active ? 'text-blue-600' : 'text-gray-500'}`} />
                                    {item.badge && item.badge > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-4 h-4 text-[10px] flex items-center justify-center">
                                            {item.badge}
                                        </span>
                                    )}
                                </div>
                                <span className={`text-[10px] mt-0.5 ${item.active ? 'text-blue-600 font-medium' : 'text-gray-600'}`}>
                                    {item.name}
                                </span>
                            </>
                        );

                        if (item.onClick) {
                            return (
                                <button
                                    key={item.name}
                                    onClick={item.onClick}
                                    className="flex flex-col items-center justify-center flex-1 h-full active:bg-gray-50 transition-colors py-1"
                                >
                                    {content}
                                </button>
                            );
                        }

                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`flex flex-col items-center justify-center flex-1 h-full transition-colors py-1 ${item.active ? 'text-blue-600' : 'text-gray-600'
                                    }`}
                            >
                                {content}
                            </Link>
                        );
                    })}
                </div>
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

export default BottomNavigationBar;