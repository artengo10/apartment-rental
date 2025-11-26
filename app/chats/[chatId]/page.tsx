'use client';

import { useEffect, useState, useRef } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';

interface Message {
    id: number;
    content: string;
    senderId: number;
    createdAt: string;
    isRead: boolean;
    sender: {
        id: number;
        name: string;
    };
}

interface Chat {
    id: number;
    apartment: {
        id: number;
        title: string;
        price: number;
        images: string[];
        address: string;
    };
    tenant: { id: number; name: string; phone: string };
    host: { id: number; name: string; phone: string };
    messages: Message[];
}

export default function ChatPage() {
    const { user, isLoading } = useAuth();
    const params = useParams();
    const router = useRouter();
    const chatId = params.chatId as string;

    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [isTyping, setIsTyping] = useState(false);
    const [otherUserTyping, setOtherUserTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isMounted, setIsMounted] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout>();
    const pollIntervalRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        setIsMounted(true);
        return () => {
            setIsMounted(false);
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        };
    }, []);

    // Polling для обновления сообщений
    useEffect(() => {
        if (!isMounted || !chatId || !user) return;

        // Начинаем polling каждые 3 секунды
        pollIntervalRef.current = setInterval(() => {
            fetchMessages();
        }, 3000);

        return () => {
            if (pollIntervalRef.current) {
                clearInterval(pollIntervalRef.current);
            }
        };
    }, [isMounted, chatId, user]);

    const fetchMessages = async () => {
        if (!isMounted || !chatId) return;

        try {
            const token = localStorage.getItem('auth_token');
            if (!token) return;

            const response = await fetch(`/api/chats/${chatId}/messages`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const messagesData = await response.json();
                setMessages(messagesData);
            }
        } catch (error) {
            console.error('❌ Error fetching messages:', error);
        }
    };

    const fetchChat = async () => {
        if (!isMounted) return;

        try {
            setError(null);
            setLoading(true);

            const token = localStorage.getItem('auth_token');
            if (!token) {
                throw new Error('Токен авторизации не найден');
            }

            const response = await fetch(`/api/chats/${chatId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(`Ошибка ${response.status}: ${errorText}`);
            }

            const data = await response.json();

            if (isMounted) {
                setChat(data);
                setMessages(data.messages || []);
            }
        } catch (error) {
            console.error('❌ Error loading chat:', error);
            if (isMounted) {
                setError(error instanceof Error ? error.message : 'Ошибка загрузки чата');
            }
        } finally {
            if (isMounted) {
                setLoading(false);
            }
        }
    };

    // Обработчик ввода сообщения (для индикатора "печатает...")
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);

        // Отправляем событие "печатает"
        if (!isTyping) {
            setIsTyping(true);
            // В реальном приложении здесь бы отправлялся запрос на сервер
        }

        // Сбрасываем таймер
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Сбрасываем индикатор через 2 секунды бездействия
        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
        }, 2000);
    };

    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !chat || !isMounted) return;

        // Сбрасываем индикатор печатания
        setIsTyping(false);
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                throw new Error('Токен авторизации не найден');
            }

            console.log('📤 Sending message to chat:', chatId);
            console.log('📝 Message content:', newMessage);

            const response = await fetch(`/api/chats/${chatId}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: newMessage })
            });

            console.log('📨 Send message response status:', response.status);

            if (!response.ok) {
                let errorText = 'Неизвестная ошибка';
                try {
                    // Пробуем получить текст ошибки
                    const errorData = await response.text();
                    errorText = errorData || `HTTP ${response.status}`;
                    console.error('❌ Server error response:', errorText);
                } catch (parseError) {
                    errorText = `HTTP ${response.status} - Не удалось прочитать ошибку`;
                }
                throw new Error(`Ошибка отправки: ${errorText}`);
            }

            // Парсим успешный ответ
            let message;
            try {
                message = await response.json();
                console.log('✅ Message sent successfully:', message);
            } catch (parseError) {
                console.error('❌ Failed to parse response:', parseError);
                throw new Error('Не удалось обработать ответ сервера');
            }

            // Добавляем сообщение в локальное состояние сразу
            setMessages(prev => [...prev, message]);
            setNewMessage('');

            // Обновляем список сообщений через секунду для синхронизации
            setTimeout(() => {
                fetchMessages();
            }, 1000);

        } catch (error) {
            console.error('❌ Error sending message:', error);
            if (isMounted) {
                setError(error instanceof Error ? error.message : 'Ошибка отправки сообщения');
            }
        }
    };
    

    const scrollToBottom = () => {
        if (messagesEndRef.current && isMounted) {
            messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    useEffect(() => {
        if (isMounted) {
            scrollToBottom();
        }
    }, [messages, isMounted]);

    useEffect(() => {
        if (!isMounted || isLoading) return;

        if (!user) {
            router.push('/');
            return;
        }

        if (!chatId) {
            setError('ID чата не указан');
            setLoading(false);
            return;
        }

        fetchChat();
    }, [user, isLoading, chatId, isMounted, router]);

    const getOtherUser = () => {
        if (!chat || !user) return null;
        return user.id === chat.host.id ? chat.tenant : chat.host;
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="pt-12 flex items-center justify-center min-h-[80vh]">
                    <div className="text-lg">Проверка авторизации...</div>
                </div>
            </div>
        );
    }

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="pt-12 flex items-center justify-center min-h-[80vh]">
                    <div className="text-lg">Не авторизован</div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="pt-12 flex items-center justify-center min-h-[80vh]">
                    <div className="text-lg">Загрузка чата...</div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="pt-12 flex items-center justify-center min-h-[80vh]">
                    <div className="text-center">
                        <div className="text-lg text-red-600 mb-4">{error}</div>
                        <button
                            onClick={fetchChat}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md"
                        >
                            Попробовать снова
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    if (!chat) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="pt-12 flex items-center justify-center min-h-[80vh]">
                    <div className="text-lg">Чат не найден</div>
                </div>
            </div>
        );
    }

    const otherUser = getOtherUser();

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="pt-12">
                <div className="bg-white border-b shadow-sm sticky top-16 z-10">
                    <div className="container mx-auto px-4 py-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                                <Link
                                    href="/chats"
                                    className="text-blue-600 hover:text-blue-800 flex items-center"
                                >
                                    <svg className="w-5 h-5 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                    </svg>
                                    Назад к чатам
                                </Link>

                                <Link
                                    href={`/profile/${otherUser?.id}`}
                                    className="flex items-center space-x-3 hover:bg-gray-50 rounded-lg p-2 transition-colors"
                                >
                                    <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                        {otherUser?.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h1 className="font-semibold text-gray-900 hover:text-blue-600 transition-colors">
                                            {otherUser?.name}
                                        </h1>
                                        <p className="text-xs text-gray-600">
                                            Профиль пользователя
                                        </p>
                                    </div>
                                </Link>
                            </div>

                            <Link
                                href={`/apartment/${chat.apartment.id}`}
                                className="text-right hover:bg-gray-50 rounded-lg p-2 transition-colors max-w-xs"
                            >
                                <p className="text-sm font-medium text-gray-900 truncate">
                                    {chat.apartment.title}
                                </p>
                                <p className="text-xs text-gray-500 mt-1 truncate">
                                    {chat.apartment.address}
                                </p>
                            </Link>
                        </div>
                    </div>
                </div>

                <div className="container mx-auto px-4 py-6 max-w-4xl">
                    <div className="bg-white rounded-lg shadow-sm border h-[600px] flex flex-col">
                        <div className="flex-1 p-4 overflow-y-auto">
                            {messages.length === 0 ? (
                                <div className="text-center text-gray-500 mt-8">
                                    <div className="text-4xl mb-4">💬</div>
                                    <p className="text-lg mb-2">Начните общение с {otherUser?.name}</p>
                                    <p className="text-sm text-gray-400">
                                        Напишите первое сообщение, чтобы начать диалог
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {messages.map((message) => (
                                        <div
                                            key={message.id}
                                            className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
                                        >
                                            <div
                                                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${message.senderId === user.id
                                                        ? 'bg-blue-500 text-white rounded-br-none'
                                                        : 'bg-gray-200 text-gray-900 rounded-bl-none'
                                                    }`}
                                            >
                                                <p className="text-sm">{message.content}</p>
                                                <p
                                                    className={`text-xs mt-1 ${message.senderId === user.id ? 'text-blue-100' : 'text-gray-500'
                                                        }`}
                                                >
                                                    {formatTime(message.createdAt)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}

                                    {/* Индикатор "печатает..." (просто демо) */}
                                    {isTyping && (
                                        <div className="flex justify-start">
                                            <div className="bg-gray-200 text-gray-900 rounded-2xl rounded-bl-none px-4 py-2 max-w-xs">
                                                <div className="flex space-x-1">
                                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                    <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div ref={messagesEndRef} />
                                </div>
                            )}
                        </div>

                        <form onSubmit={sendMessage} className="p-4 border-t">
                            <div className="flex space-x-4">
                                <input
                                    type="text"
                                    value={newMessage}
                                    onChange={handleInputChange}
                                    placeholder="Введите сообщение..."
                                    className="flex-1 px-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim()}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Отправить
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </div>
    );
}
