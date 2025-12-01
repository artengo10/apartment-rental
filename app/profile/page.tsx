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


    // Добавьте этот компонент в app/profile/page.tsx перед существующим кодом
    const EditProfileForm = ({ user, onSave, onCancel }: {
        user: any;
        onSave: (data: any) => void;
        onCancel: () => void
    }) => {
        const [formData, setFormData] = useState({
            name: user?.name || '',
            email: user?.email || '',
            phone: user?.phone || '',
        });
        const [loading, setLoading] = useState(false);
        const [error, setError] = useState('');

        const handleSubmit = async (e: React.FormEvent) => {
            e.preventDefault();
            setLoading(true);
            setError('');

            try {
                const token = localStorage.getItem('auth_token');
                const response = await fetch('/api/user-profile', {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify(formData)
                });

                if (response.ok) {
                    const updatedUser = await response.json();
                    onSave(updatedUser);
                } else {
                    const errorData = await response.json();
                    setError(errorData.error || 'Ошибка при обновлении профиля');
                }
            } catch (error) {
                setError('Ошибка сети');
            } finally {
                setLoading(false);
            }
        };

        return (
            <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-xl font-semibold mb-4">Редактировать профиль</h3>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Имя и фамилия
                            </label>
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                value={formData.email}
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Телефон
                            </label>
                            <input
                                type="tel"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                required
                            />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            >
                                {loading ? 'Сохранение...' : 'Сохранить'}
                            </button>
                            <button
                                type="button"
                                onClick={onCancel}
                                className="bg-gray-300 text-gray-700 px-6 py-2 rounded-lg hover:bg-gray-400 transition-colors"
                            >
                                Отмена
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };


    const ProfileInfo = () => {
        const { user } = useAuth();
        const [isEditing, setIsEditing] = useState(false);
        const [currentUser, setCurrentUser] = useState(user);

        useEffect(() => {
            setCurrentUser(user);
        }, [user]);

        const handleSave = (updatedUser: any) => {
            setCurrentUser(updatedUser);
            setIsEditing(false);
            // Можно добавить обновление контекста здесь
            window.location.reload(); // Или обновить страницу для применения изменений
        };

        if (isEditing) {
            return <EditProfileForm
                user={currentUser}
                onSave={handleSave}
                onCancel={() => setIsEditing(false)}
            />;
        }

        return (
            <div className="space-y-6">
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-semibold">Личная информация</h3>
                        <button
                            onClick={() => setIsEditing(true)}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm"
                        >
                            ✏️ Редактировать
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm text-gray-500">Имя и фамилия</label>
                            <p className="font-medium">{currentUser?.name}</p>
                        </div>
                        <div>
                            <label className="text-sm text-gray-500">Email</label>
                            <p className="font-medium">{currentUser?.email}</p>
                        </div>
                        <div>
                            <label className="text-sm text-gray-500">Телефон</label>
                            <p className="font-medium">{currentUser?.phone}</p>
                        </div>
                        <div>
                            <label className="text-sm text-gray-500">Статус</label>
                            <p className="font-medium">
                                <span className={`px-2 py-1 rounded-full text-xs ${currentUser?.isVerified
                                        ? 'bg-green-100 text-green-800'
                                        : 'bg-yellow-100 text-yellow-800'
                                    }`}>
                                    {currentUser?.isVerified ? 'Подтвержден' : 'Не подтвержден'}
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
    };

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

    const Reviews = () => {
        const { user } = useAuth();
        const [reviews, setReviews] = useState<any[]>([]);
        const [loading, setLoading] = useState(true);

        useEffect(() => {
            if (user) {
                fetchHostReviews();
            } else {
                setLoading(false);
            }
        }, [user]);

        const fetchHostReviews = async () => {
            try {
                // Используем тот же endpoint, что и в публичном профиле
                const response = await fetch(`/api/reviews/host/${user!.id}`);
                if (response.ok) {
                    const reviewsData = await response.json();
                    console.log('Отзывы получены:', reviewsData);
                    setReviews(reviewsData);
                } else {
                    console.error('Ошибка при загрузке отзывов:', response.status);
                }
            } catch (error) {
                console.error('Error fetching host reviews:', error);
            } finally {
                setLoading(false);
            }
        };

        if (!user) {
            return (
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-xl font-semibold mb-4">Отзывы о вас</h3>
                    <div className="text-center py-8">
                        <p className="text-gray-500">Необходимо авторизоваться</p>
                    </div>
                </div>
            );
        }

        if (loading) {
            return (
                <div className="bg-white rounded-lg shadow-sm p-6">
                    <h3 className="text-xl font-semibold mb-4">Отзывы о вас</h3>
                    <div className="text-center py-4">Загрузка отзывов...</div>
                </div>
            );
        }

        return (
            <div className="bg-white rounded-lg shadow-sm p-6">
                <h3 className="text-xl font-semibold mb-4">
                    Отзывы о вас ({reviews.length})
                </h3>

                {reviews.length === 0 ? (
                    <div className="text-center py-8">
                        <div className="text-4xl mb-2">📝</div>
                        <p className="text-gray-500">Пока нет отзывов о вас</p>
                        <p className="text-sm text-gray-400 mt-2">
                            Отзывы появятся после того, как другие пользователи оставят их
                        </p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {reviews.map((review) => (
                            <div
                                key={review.id}
                                className="border border-gray-200 rounded-lg p-4"
                            >
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="font-semibold">
                                            От: {review.author?.name || 'Аноним'}
                                        </div>
                                        {review.apartment && (
                                            <div className="text-sm text-gray-600">
                                                По объявлению: {review.apartment.title}
                                            </div>
                                        )}
                                        <div className="text-sm text-gray-500">
                                            {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                                        </div>
                                    </div>
                                    <div className="bg-green-100 text-green-800 px-2 py-1 rounded text-xs">
                                        ✅ Одобрен
                                    </div>
                                </div>

                                {/* Компонент рейтинга */}
                                <div className="flex items-center gap-1 mb-2">
                                    {[...Array(5)].map((_, i) => (
                                        <span
                                            key={i}
                                            className={`text-xl ${i < review.rating
                                                    ? 'text-yellow-400'
                                                    : 'text-gray-300'
                                                }`}
                                        >
                                            ★
                                        </span>
                                    ))}
                                    <span className="text-sm text-gray-600 ml-2">
                                        {review.rating}/5
                                    </span>
                                </div>

                                <p className="text-gray-700">{review.comment}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        );
    };
    
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