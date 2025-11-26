'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';

interface Chat {
    id: number;
    apartment: {
        id: number;
        title: string;
        price: number;
        images: string[];
    };
    tenant: { id: number; name: string };
    host: { id: number; name: string };
    messages: Array<{
        id: number;
        content: string;
        createdAt: string;
        sender: { id: number; name: string };
    }>;
    unreadCount: number;
    updatedAt: string;
}

export default function ChatsPage() {
    const { user } = useAuth();
    const router = useRouter();
    const [chats, setChats] = useState<Chat[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Если пользователь не авторизован, редиректим
        if (!user) {
            router.push('/');
            return;
        }

        // Если авторизован, загружаем чаты
        fetchChats();
    }, [user, router]);

    const fetchChats = async () => {
        try {
            setError(null);
            const token = localStorage.getItem('auth_token');
            console.log('🔑 Token from localStorage:', token);

            if (!token) {
                setError('Токен авторизации не найден');
                setLoading(false);
                return;
            }

            console.log('📡 Fetching chats from API...');
            const response = await fetch('/api/chats', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            console.log('📊 Response status:', response.status);

            if (response.ok) {
                const data = await response.json();
                console.log('✅ Chats data received:', data);
                setChats(data);
            } else {
                const errorData = await response.json();
                console.error('❌ Error loading chats:', response.status, errorData);
                setError(`Ошибка загрузки: ${errorData.error || 'Неизвестная ошибка'}`);
            }
        } catch (error) {
            console.error('❌ Network error:', error);
            setError('Ошибка сети. Проверьте подключение к интернету.');
        } finally {
            setLoading(false);
        }
    };

    const getOtherUser = (chat: Chat) => {
        if (!user) return chat.host;
        return user.id === chat.host.id ? chat.tenant : chat.host;
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        const now = new Date();
        const diff = now.getTime() - date.getTime();
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (days === 0) {
            return date.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit' });
        } else if (days === 1) {
            return 'Вчера';
        } else if (days < 7) {
            return `${days} дн. назад`;
        } else {
            return date.toLocaleDateString('ru-RU');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="pt-16 flex items-center justify-center min-h-[80vh]">
                    <div className="text-lg">Загрузка чатов...</div>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="pt-16">
                <div className="container mx-auto px-4 py-8 max-w-4xl">
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="p-6 border-b flex justify-between items-center">
                            <h1 className="text-2xl font-bold text-gray-900">Мои сообщения</h1>
                            <button
                                onClick={fetchChats}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-sm"
                            >
                                Обновить
                            </button>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 border-l-4 border-red-500">
                                <p className="text-red-700">{error}</p>
                                <button
                                    onClick={fetchChats}
                                    className="mt-2 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm"
                                >
                                    Попробовать снова
                                </button>
                            </div>
                        )}

                        {chats.length === 0 && !error ? (
                            <div className="p-8 text-center text-gray-500">
                                <div className="text-6xl mb-4">💬</div>
                                <p className="text-lg mb-2">У вас пока нет сообщений</p>
                                <p className="text-sm text-gray-400 mb-4">
                                    Начните общение, написав владельцу интересующего вас жилья
                                </p>
                                <Link
                                    href="/results"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md inline-block"
                                >
                                    Найти жилье
                                </Link>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {chats.map((chat) => {
                                    const otherUser = getOtherUser(chat);
                                    const lastMessage = chat.messages[0];

                                    return (
                                        <Link
                                            key={chat.id}
                                            href={`/chats/${chat.id}`}
                                            className="block hover:bg-gray-50 transition-colors"
                                        >
                                            <div className="p-4 flex items-center space-x-4">
                                                <div className="flex-shrink-0 w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                                    {otherUser.name.charAt(0).toUpperCase()}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between mb-1">
                                                        <h3 className="font-semibold text-gray-900 truncate">
                                                            {otherUser.name}
                                                        </h3>
                                                        <span className="text-xs text-gray-500 whitespace-nowrap ml-2">
                                                            {formatTime(chat.updatedAt)}
                                                        </span>
                                                    </div>

                                                    <p className="text-sm text-gray-600 mb-1 truncate">
                                                        {chat.apartment.title}
                                                    </p>

                                                    {lastMessage && (
                                                        <p className="text-sm text-gray-500 truncate">
                                                            <span className={lastMessage.sender.id === user.id ? 'text-gray-400' : 'text-gray-900'}>
                                                                {lastMessage.sender.id === user.id ? 'Вы: ' : ''}
                                                            </span>
                                                            {lastMessage.content}
                                                        </p>
                                                    )}
                                                </div>

                                                {chat.unreadCount > 0 && (
                                                    <div className="flex-shrink-0">
                                                        <div className="bg-red-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center">
                                                            {chat.unreadCount}
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}