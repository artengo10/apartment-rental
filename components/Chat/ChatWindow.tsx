'use client';

import { useState, useRef, useEffect } from 'react';
import { useSocket } from '@/hooks/useSocket';

interface ChatWindowProps {
    chatId: number;
    currentUserId: number;
}

interface Message {
    id: number;
    content: string;
    senderId: number;
    createdAt: string;
}

export default function ChatWindow({ chatId, currentUserId }: ChatWindowProps) {
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState<Message[]>([]);
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const { socket, isConnected, sendMessage, sendTyping, typingUsers } = useSocket();

    // Загрузка сообщений
    useEffect(() => {
        const loadMessages = async () => {
            try {
                const response = await fetch(`/api/chats/${chatId}/messages`);
                const data = await response.json();
                setMessages(data);
            } catch (error) {
                console.error('Error loading messages:', error);
            }
        };

        loadMessages();
    }, [chatId]);

    // Подписка на сокет события
    useEffect(() => {
        if (!socket) return;

        // Слушаем новые сообщения
        socket.on('new_message', (newMessage: Message) => {
            setMessages(prev => [...prev, newMessage]);
        });

        // Слушаем статус печатания
        socket.on('typing_status', (data: { userId: number; isTyping: boolean }) => {
            if (data.userId !== currentUserId) {
                setIsTyping(data.isTyping);
            }
        });

        return () => {
            socket.off('new_message');
            socket.off('typing_status');
        };
    }, [socket, currentUserId]);

    // Автопрокрутка к новым сообщениям
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    // Отправка сообщения
    const handleSendMessage = async () => {
        if (!message.trim() || !isConnected) return;

        const newMessage = {
            chatId,
            senderId: currentUserId,
            content: message,
            isRead: false
        };

        try {
            // Отправляем через REST API
            const response = await fetch(`/api/chats/${chatId}/messages`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newMessage)
            });

            if (response.ok) {
                // Отправляем через WebSocket для реального времени
                sendMessage(newMessage); // ✅ ПРАВИЛЬНО: один аргумент

                setMessage('');
                sendTyping(false); // ✅ ПРАВИЛЬНО: один аргумент, boolean
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    // Обработчик ввода текста
    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setMessage(value);

        // Отправляем статус печатания
        if (value.length > 0 && !isTyping) {
            sendTyping(true); // ✅ ПРАВИЛЬНО
            setIsTyping(true);
        } else if (value.length === 0 && isTyping) {
            sendTyping(false); // ✅ ПРАВИЛЬНО
            setIsTyping(false);
        }
    };

    // Обработчик нажатия Enter
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSendMessage();
        }
    };

    return (
        <div className="flex flex-col h-full">
            {/* Заголовок чата */}
            <div className="border-b p-4">
                <h2 className="text-lg font-semibold">Чат</h2>
                {isTyping && (
                    <p className="text-sm text-gray-500">Собеседник печатает...</p>
                )}
            </div>

            {/* Сообщения */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`flex ${msg.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
                    >
                        <div
                            className={`max-w-xs rounded-lg px-4 py-2 ${msg.senderId === currentUserId
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-gray-200 text-gray-800'
                                }`}
                        >
                            <p>{msg.content}</p>
                            <p className="text-xs opacity-75 mt-1">
                                {new Date(msg.createdAt).toLocaleTimeString([], {
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </p>
                        </div>
                    </div>
                ))}
                <div ref={messagesEndRef} />
            </div>

            {/* Форма ввода */}
            <div className="border-t p-4">
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={message}
                        onChange={handleInputChange}
                        onKeyPress={handleKeyPress}
                        placeholder="Введите сообщение..."
                        className="flex-1 border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                        onClick={handleSendMessage}
                        disabled={!message.trim() || !isConnected}
                        className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        Отправить
                    </button>
                </div>
                <p className="text-xs text-gray-500 mt-2">
                    {isConnected ? '✓ Соединение установлено' : '⌛ Соединение...'}
                </p>
            </div>
        </div>
    );
}
