'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';

type TabType = 'profile' | 'apartments' | 'reviews' | 'chat';

export default function ProfilePage() {
    const { user, logout } = useAuth();
    const router = useRouter();
    const [activeTab, setActiveTab] = useState<TabType>('profile');
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
    }, []);

    // Плавный переход если пользователь не авторизован
    useEffect(() => {
        if (isClient && !user) {
            const timer = setTimeout(() => {
                router.push('/');
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [user, isClient, router]);

    if (!isClient) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="pt-16 flex items-center justify-center min-h-[80vh]">
                    <div className="text-lg">Загрузка...</div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="pt-16 flex items-center justify-center min-h-[80vh]">
                    <div className="text-lg">Перенаправление...</div>
                </div>
            </div>
        );
    }

    const handleLogout = () => {
        logout();
        // Небольшая задержка для лучшего UX
        setTimeout(() => {
            router.push('/');
        }, 100);
    };

    const ProfileInfo = () => (
        <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-semibold mb-4">Личная информация</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <label className="text-sm text-gray-500">Имя</label>
                        <p className="font-medium">{user.name}</p>
                    </div>
                    <div>
                        <label className="text-sm text-gray-500">Email</label>
                        <p className="font-medium">{user.email}</p>
                    </div>
                    <div>
                        <label className="text-sm text-gray-500">Телефон</label>
                        <p className="font-medium">{user.phone}</p>
                    </div>
                    <div>
                        <label className="text-sm text-gray-500">Статус</label>
                        <p className="font-medium">
                            <span className={`px-2 py-1 rounded-full text-xs ${user.isVerified
                                ? 'bg-green-100 text-green-800'
                                : 'bg-yellow-100 text-yellow-800'
                                }`}>
                                {user.isVerified ? 'Подтвержден' : 'Не подтвержден'}
                            </span>
                        </p>
                    </div>
                </div>
            </div>

            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-semibold mb-4">Безопасность</h3>
                <div className="text-gray-600 text-sm">
                    <p>Ваша сессия сохраняется между перезагрузками страницы</p>
                    <p className="mt-2 text-green-600">✓ Авторизация активна</p>
                </div>
            </div>
        </div>
    );

    const MyApartments = () => (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold mb-4">Мои объявления</h3>
            <p className="text-gray-600 mb-4">Управляйте вашими объявлениями о жилье</p>
            <Link
                href="/my-apartments"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block"
            >
                Перейти к моим объявлениям
            </Link>
        </div>
    );

    const Reviews = () => (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold mb-4">Отзывы</h3>
            <div className="text-center py-8">
                <p className="text-gray-500">Здесь будут отображаться отзывы от других пользователей</p>
                <p className="text-sm text-gray-400 mt-2">Функция в разработке</p>
            </div>
        </div>
    );

    const Chat = () => (
        <div className="bg-white rounded-lg shadow-sm p-6">
            <h3 className="text-xl font-semibold mb-4">Сообщения</h3>
            <div className="text-center py-8">
                <p className="text-gray-500">Здесь будут ваши диалоги с другими пользователями</p>
                <Link
                    href="/chats"
                    className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors inline-block mt-4"
                >
                    Перейти к сообщениям
                </Link>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="pt-16">
                <div className="container mx-auto px-4 max-w-4xl py-8">
                    {/* Заголовок */}
                    <div className="flex justify-between items-center mb-8">
                        <div>
                            <h1 className="text-3xl font-bold">Профиль</h1>
                            <p className="text-gray-600">Управляйте вашей учетной записью</p>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 transition-colors"
                        >
                            Выйти
                        </button>
                    </div>

                    {/* Информация о пользователе в карточке */}
                    <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                        <div className="flex items-center gap-4">
                            <div className="w-16 h-16 bg-blue-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                                {user.name?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                                <h2 className="text-xl font-semibold">{user.name}</h2>
                                <p className="text-gray-600">{user.email}</p>
                                <p className="text-gray-500 text-sm">
                                    {user.isVerified ? '✅ Подтвержденный аккаунт' : '⏳ Ожидает подтверждения'}
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Вкладки */}
                    <div className="border-b border-gray-200 mb-6">
                        <nav className="flex space-x-8">
                            {[
                                { id: 'profile' as TabType, name: 'Профиль', icon: '👤' },
                                { id: 'apartments' as TabType, name: 'Мои объявления', icon: '🏠' },
                                { id: 'reviews' as TabType, name: 'Отзывы', icon: '⭐' },
                                { id: 'chat' as TabType, name: 'Сообщения', icon: '💬' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id)}
                                    className={`py-2 px-1 border-b-2 font-medium text-sm flex items-center gap-2 ${activeTab === tab.id
                                        ? 'border-blue-500 text-blue-600'
                                        : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                        }`}
                                >
                                    <span>{tab.icon}</span>
                                    {tab.name}
                                </button>
                            ))}
                        </nav>
                    </div>

                    {/* Контент вкладок */}
                    <div>
                        {activeTab === 'profile' && <ProfileInfo />}
                        {activeTab === 'apartments' && <MyApartments />}
                        {activeTab === 'reviews' && <Reviews />}
                        {activeTab === 'chat' && <Chat />}
                    </div>
                </div>
            </div>
        </div>
    );
}