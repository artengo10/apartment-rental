'use client';
import { useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import LoginModal from './modals/LoginModal';
import RegisterModal from './modals/RegisterModal';
import AddApartmentModal from './modals/AddApartmentWizard';

export default function Header() {
    const { user, logout } = useAuth();
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [showRegisterModal, setShowRegisterModal] = useState(false);
    const [showAddApartmentModal, setShowAddApartmentModal] = useState(false);

    const handleLogout = () => {
        logout();
    };

    // Функция для получения только имени (первого слова)
    const getFirstName = (fullName: string) => {
        return fullName.split(' ')[0];
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
                                    className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md font-medium transition-colors text-sm"
                                >
                                    + Добавить жилье
                                </button>

                                {/* Иконка чата */}
                                <Link
                                    href="/chats"
                                    className="relative bg-blue-600 hover:bg-blue-700 text-white p-2 rounded-md font-medium transition-colors flex items-center justify-center"
                                    title="Сообщения"
                                >
                                    <span className="text-lg">💬</span>
                                    {/* Показываем бейдж только если есть непрочитанные сообщения */}
                                    {/* Позже можно добавить логику для подсчета непрочитанных */}
                                </Link>

                                <div className="text-right hidden sm:block">
                                    <p className="text-sm font-medium">
                                        Привет, {getFirstName(user.name)}!
                                    </p>
                                    {/* Убрали отображение роли */}
                                </div>
                                {user && (
                                    <div className="flex items-center gap-4">
                                        <Link
                                            href="/profile"
                                            className="flex items-center gap-2 text-gray-700 hover:text-gray-900 transition-colors"
                                        >
                                            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-medium">
                                                {user.name?.charAt(0).toUpperCase() || 'U'}
                                            </div>
                                            <span className="hidden sm:block">{user.name}</span>
                                        </Link>
                                    </div>
                                )}
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

            {/* Модальное окно для добавления жилья */}
            <AddApartmentModal
                isOpen={showAddApartmentModal}
                onClose={() => setShowAddApartmentModal(false)}
                onSuccess={() => {
                    // Можно добавить уведомление об успешном добавлении
                    console.log('Жилье успешно добавлено!');
                }}
            />
        </>
    );
}