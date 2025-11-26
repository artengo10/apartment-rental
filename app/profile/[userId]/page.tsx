'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';

interface PublicUser {
    id: number;
    name: string;
    email: string;
    phone: string;
    avatar?: string;
    isVerified: boolean;
    createdAt: string;
}

export default function PublicProfilePage() {
    const params = useParams();
    const { user: currentUser } = useAuth();
    const userId = params.userId as string;

    const [user, setUser] = useState<PublicUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchUserProfile();
    }, [userId]);

    const fetchUserProfile = async () => {
        try {
            // Используем ваш существующий endpoint с параметром userId
            const response = await fetch(`/api/users/profile?userId=${userId}`);

            if (response.ok) {
                const userData = await response.json();
                setUser(userData);
            } else {
                setError('Пользователь не найден');
            }
        } catch (error) {
            console.error('Error fetching user profile:', error);
            setError('Ошибка загрузки профиля');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="pt-16 flex items-center justify-center min-h-[80vh]">
                    <div className="text-lg">Загрузка профиля...</div>
                </div>
            </div>
        );
    }

    if (error || !user) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="pt-16 flex items-center justify-center min-h-[80vh]">
                    <div className="text-lg text-red-600">{error || 'Пользователь не найден'}</div>
                </div>
            </div>
        );
    }

    const isOwnProfile = currentUser?.id === user.id;

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="pt-16">
                <div className="container mx-auto px-4 py-8 max-w-4xl">
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="p-8">
                            {/* Заголовок */}
                            <div className="text-center mb-8">
                                <div className="w-24 h-24 bg-blue-500 rounded-full flex items-center justify-center text-white text-3xl font-bold mx-auto mb-4">
                                    {user.name.charAt(0).toUpperCase()}
                                </div>
                                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                                {user.isVerified && (
                                    <div className="inline-flex items-center bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm mt-2">
                                        ✅ Проверенный пользователь
                                    </div>
                                )}
                            </div>

                            {/* Информация */}
                            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-900 mb-2">Контактная информация</h3>
                                    <div className="space-y-2">
                                        <div>
                                            <span className="text-sm text-gray-600">Телефон:</span>
                                            <p className="font-medium">{user.phone}</p>
                                        </div>
                                        <div>
                                            <span className="text-sm text-gray-600">Email:</span>
                                            <p className="font-medium">{user.email}</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-lg p-4">
                                    <h3 className="font-semibold text-gray-900 mb-2">На платформе с</h3>
                                    <p className="text-gray-600">
                                        {new Date(user.createdAt).toLocaleDateString('ru-RU', {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric'
                                        })}
                                    </p>
                                </div>
                            </div>

                            {/* Если это не свой профиль, показываем кнопку написать */}
                            {!isOwnProfile && currentUser && (
                                <div className="text-center mt-8">
                                    <Link
                                        href={`/chats?userId=${user.id}`}
                                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg inline-flex items-center transition-colors"
                                    >
                                        <span className="mr-2">💬</span>
                                        Написать сообщение
                                    </Link>
                                </div>
                            )}

                            {/* Если это свой профиль, показываем кнопку редактирования */}
                            {isOwnProfile && (
                                <div className="text-center mt-8">
                                    <Link
                                        href="/profile"
                                        className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-lg inline-flex items-center transition-colors"
                                    >
                                        <span className="mr-2">✏️</span>
                                        Редактировать профиль
                                    </Link>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}