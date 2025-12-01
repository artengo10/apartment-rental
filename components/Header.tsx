// components/Header.tsx - с правильным импортом useFavorites
'use client';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';
import LoginModal from './modals/LoginModal';
import RegisterModal from './modals/RegisterModal';
import AddApartmentModal from './modals/AddApartmentWizard';
import { Heart, MessageCircle, User, Plus } from 'lucide-react';

export default function Header() {
    const { user, logout } = useAuth();
    const { favoriteIds } = useFavorites();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showAddApartmentModal, setShowAddApartmentModal] = useState(false);

    const handleLogout = () => {
        logout();
        localStorage.removeItem('favorite_ids');
    };

    const getDisplayName = (fullName: string): string => {
        const nameParts = fullName.trim().split(/\s+/).filter(part => part.length > 0);

        // Русские имена обычно: Фамилия Имя Отчество
        if (nameParts.length >= 2) {
            // Пропускаем первый элемент (фамилию), берем остальные
            return nameParts.slice(1).join(' ');
        }

        return nameParts[0] || 'Пользователь';
    };

    return (
        <>
            <header className="bg-primary text-primary-foreground px-3 py-2 sm:px-6 sm:py-4 shadow-sm border-b border-black">
                <div className="container mx-auto flex justify-between items-center">
                    <Link
                        href="/"
                        className="text-left hover:opacity-80 transition-opacity"
                    >
                        <h1 className="text-lg sm:text-2xl font-bold">СъёмБронь</h1>
                        <p className="text-xs text-primary-foreground/80 hidden xs:block">
                            Умный поиск жилья в Нижнем Новгороде
                        </p>
                    </Link>

                    <nav className="flex gap-2">
                        {user ? (
                            <div className="flex items-center gap-4">
                                {/* Кнопка добавления жилья */}
                                <button
                                    onClick={() => setShowAddApartmentModal(true)}
                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md font-medium transition-colors text-sm flex items-center gap-1"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span className="hidden sm:inline">Добавить жилье</span>
                                </button>

                                {/* Иконка избранных */}
                                <Link
                                    href="/favorites"
                                    className="relative bg-pink-600 hover:bg-pink-700 text-white p-2 rounded-md font-medium transition-colors flex items-center justify-center"
                                    title="Избранное"
                                >
                                    <Heart className="w-5 h-5" />
                                    {favoriteIds.length > 0 && (
                                        <span className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full w-5 h-5 text-xs flex items-center justify-center">
                                            {favoriteIds.length}
                                        </span>
                                    )}
                                </Link>

                                {/* Иконка чата */}
                                <Link
                                    href="/chats"
                                    className="bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md font-medium transition-colors flex items-center justify-center"
                                    title="Сообщения"
                                >
                                    <MessageCircle className="w-5 h-5" />
                                </Link>

                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-medium">
                                        Привет, {getDisplayName(user.name)}!
                                    </p>
                                </div>

                                <div className="flex items-center gap-4">
                                    <Link
                                        href="/profile"
                                        className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
                                    >
                                        <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                                            <User className="w-4 h-4" />
                                        </div>
                                        <span className="hidden sm:block">{user.name}</span>
                                    </Link>
                                </div>
                            </div>
                        ) : (
                            <>
                                <button
                                    onClick={() => setShowLoginModal(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md font-medium transition-colors text-sm"
                                >
                                    Войти
                                </button>
                                <button
                                    onClick={() => setShowRegisterModal(true)}
                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md font-medium transition-colors text-sm border border-black"
                                >
                                    Регистрация
                                </button>
                            </>
                        )}
                    </nav>
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
            />
            <RegisterModal
                isOpen={showRegisterModal}
                onClose={() => setShowRegisterModal(false)}
                onSwitchToLogin={() => {
                    setShowRegisterModal(false);
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
