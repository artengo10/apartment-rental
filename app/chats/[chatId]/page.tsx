// chats/[chatId]/page.tsx - ОБНОВЛЕННЫЙ С КНОПКОЙ ОТЗЫВА
'use client';

import { useEffect, useState, useRef, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { useSocket } from '@/hooks/useSocket';
import CreateReviewModal from '@/components/modals/CreateReviewModal';

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

    const { socket, isConnected } = useSocket();

    const [chat, setChat] = useState<Chat | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [otherUserTyping, setOtherUserTyping] = useState(false);
    const [showReviewModal, setShowReviewModal] = useState(false);
    const [hasReviewed, setHasReviewed] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const [isMounted, setIsMounted] = useState(false);
    const typingTimeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        setIsMounted(true);
        return () => {
            setIsMounted(false);
            if (typingTimeoutRef.current) {
                clearTimeout(typingTimeoutRef.current);
            }
        };
    }, []);

    // Socket.IO события
    useEffect(() => {
        if (!socket || !isConnected || !chatId) return;

        // Присоединяемся к комнате чата
        socket.emit('join-chats');

        // Слушаем новые сообщения
        socket.on('new-message', (message: Message) => {
            console.log('💬 New message received:', message);
            setMessages(prev => [...prev, message]);
        });

        // Слушаем индикатор печатания
        socket.on('user-typing', (data: { userId: number; chatId: number; isTyping: boolean }) => {
            if (data.userId !== user?.id && data.chatId === parseInt(chatId)) {
                console.log('✍️ Typing status:', data.isTyping);
                setOtherUserTyping(data.isTyping);
            }
        });

        // Слушаем ошибки
        socket.on('error', (error: { message: string }) => {
            console.error('Socket error:', error);
            setError(error.message);
        });

        return () => {
            socket.off('new-message');
            socket.off('user-typing');
            socket.off('error');
        };
    }, [socket, isConnected, chatId, user]);

    // Загрузка чата и сообщений (только один раз при монтировании)
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
                throw new Error(`Ошибка загрузки чата`);
            }

            const data = await response.json();

            if (isMounted) {
                setChat(data);
                setMessages(data.messages || []);

                // Проверяем, оставлял ли пользователь уже отзыв для этого чата
                checkIfReviewed(data.host.id, data.id);
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

    // Проверяем, оставлял ли пользователь уже отзыв для этого чата
    const checkIfReviewed = async (hostId: number, chatId: number) => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`/api/reviews/check?hostId=${hostId}&chatId=${chatId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setHasReviewed(data.hasReviewed);
            }
        } catch (error) {
            console.error('Error checking review:', error);
        }
    };

    // Отправка сообщения через Socket.IO
    const sendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newMessage.trim() || !chat || !socket || !isConnected || !user) return;

        // Сбрасываем индикатор печатания
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            socket.emit('typing-stop', { chatId: parseInt(chatId) });
        }

        try {
            console.log('📤 Sending message via socket:', newMessage);

            // Отправляем через Socket.IO
            socket.emit('send-message', {
                chatId: parseInt(chatId),
                content: newMessage
            });

            setNewMessage('');

        } catch (error) {
            console.error('❌ Error sending message:', error);
            if (isMounted) {
                setError('Ошибка отправки сообщения');
            }
        }
    };

    // Обработчик ввода сообщения с индикатором печатания
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);

        if (!socket || !isConnected) return;

        // Отправляем событие "печатает"
        if (!typingTimeoutRef.current) {
            socket.emit('typing-start', { chatId: parseInt(chatId) });
        }

        // Сбрасываем таймер
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        // Отправляем событие "перестал печатать" через 1.5 секунды
        typingTimeoutRef.current = setTimeout(() => {
            socket.emit('typing-stop', { chatId: parseInt(chatId) });
            typingTimeoutRef.current = undefined;
        }, 1500);
    };

    // Автопрокрутка к новым сообщениям
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

    // Загрузка данных при монтировании
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

            {/* Индикатор подключения */}
            {!isConnected && (
                <div className="fixed top-16 left-0 right-0 bg-yellow-500 text-white text-center py-2 z-50">
                    🔌 Подключаемся к чату...
                </div>
            )}

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

                            <div className="flex items-center gap-4">
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

                                {/* Кнопка оставить отзыв - показываем только если пользователь еще не оставлял отзыв */}
                                {!hasReviewed && (
                                    <button
                                        onClick={() => setShowReviewModal(true)}
                                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
                                    >
                                        <span>⭐</span>
                                        Оставить отзыв
                                    </button>
                                )}
                            </div>
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

                                    {/* Индикатор "печатает..." для ДРУГОГО пользователя */}
                                    {otherUserTyping && (
                                        <div className="flex justify-start">
                                            <div className="bg-gray-200 text-gray-900 rounded-2xl rounded-bl-none px-4 py-2 max-w-xs">
                                                <div className="flex items-center space-x-2">
                                                    <div className="flex space-x-1">
                                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></div>
                                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                                                        <div className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></div>
                                                    </div>
                                                    <span className="text-xs text-gray-600">{otherUser?.name} печатает...</span>
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
                                    disabled={!isConnected}
                                />
                                <button
                                    type="submit"
                                    disabled={!newMessage.trim() || !isConnected}
                                    className="px-6 py-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {isConnected ? 'Отправить' : 'Подключение...'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {/* Модальное окно создания отзыва */}
            {chat && otherUser && (
                <CreateReviewModal
                    isOpen={showReviewModal}
                    onClose={() => setShowReviewModal(false)}
                    onSuccess={() => {
                        setHasReviewed(true);
                        alert('Отзыв отправлен на модерацию! Спасибо за ваше мнение.');
                    }}
                    hostId={otherUser.id}
                    hostName={otherUser.name}
                    apartmentId={chat.apartment.id}
                    chatId={chat.id}
                />
            )}
        </div>
    );
}
