// app/apartment/[id]/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import dynamic from 'next/dynamic';

// Динамически импортируем модальное окно бронирования
const BookingModal = dynamic(
    () => import('@/components/modals/BookingModal'),
    { ssr: false }
);

// Интерфейс квартиры из API
interface Apartment {
    id: number;
    lat: number;
    lng: number;
    title: string;
    price: string;
    address: string;
    description: string;
    type: "apartment" | "house" | "studio";
    district: string;
    rooms?: number;
    area?: number;
    floor?: number;
    originalPrice?: string;
    images: string[];
    amenities?: string[];
    hostName?: string;
    hostRating?: number;
    hostId: number;
}

export default function ApartmentDetail() {
    const params = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [apartment, setApartment] = useState<Apartment | null>(null);
    const [currentImageIndex, setcurrentImageIndex] = useState(0);
    const [showChat, setShowChat] = useState(false);
    const [showBookingModal, setShowBookingModal] = useState(false);
    const [message, setMessage] = useState('');
    const [currentChatId, setCurrentChatId] = useState<number | null>(null);
    const [chatMessages, setChatMessages] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchApartment = async () => {
            try {
                const apartmentId = params.id;
                const response = await fetch(`/api/apartments/${apartmentId}`);
                if (response.ok) {
                    const data = await response.json();
                    setApartment(data);
                } else {
                    setApartment(null);
                }
            } catch (error) {
                console.error('Error fetching apartment:', error);
                setApartment(null);
            } finally {
                setLoading(false);
            }
        };

        if (params.id) {
            fetchApartment();
        }
    }, [params.id]);

    const nextImage = () => {
        if (apartment?.images && apartment.images.length > 0) {
            setcurrentImageIndex((prev) =>
                prev === apartment.images!.length - 1 ? 0 : prev + 1
            );
        }
    };

    const prevImage = () => {
        if (apartment?.images && apartment.images.length > 0) {
            setcurrentImageIndex((prev) =>
                prev === 0 ? apartment.images!.length - 1 : prev - 1
            );
        }
    };

    const handleCall = () => {
        alert(`Позвонить по номеру: +7 (999) 123-45-67\nОбъявление: ${apartment?.title}`);
    };

    // Функция для загрузки истории сообщений
    const loadChatHistory = async (chatId: number) => {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) return;

            const response = await fetch(`/api/chats/${chatId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const chatData = await response.json();
                if (chatData.messages && chatData.messages.length > 0) {
                    setChatMessages(chatData.messages);
                } else {
                    setChatMessages([]);
                }
            }
        } catch (error) {
            console.error('Error loading chat history:', error);
        }
    };

    // Функция для создания или получения чата
    const getOrCreateChat = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            if (!token) {
                alert('Для начала чата необходимо авторизоваться');
                return null;
            }

            const response = await fetch('/api/chats', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    apartmentId: apartment?.id
                })
            });

            if (response.ok) {
                const chat = await response.json();
                setCurrentChatId(chat.id);
                await loadChatHistory(chat.id);
                return chat.id;
            } else {
                const errorText = await response.text();
                let errorMessage = 'Не удалось создать чат';
                try {
                    const errorData = JSON.parse(errorText);
                    errorMessage = errorData.error || errorMessage;
                } catch (e) {
                    errorMessage = errorText || errorMessage;
                }
                alert(errorMessage);
                return null;
            }
        } catch (error) {
            console.error('❌ Error creating chat:', error);
            alert('Произошла ошибка при создании чата');
            return null;
        }
    };

    // Функция открытия чата
    const handleOpenChat = async () => {
        if (!user) {
            alert('Для начала чата необходимо авторизоваться');
            return;
        }

        setShowChat(true);
        setTimeout(async () => {
            await getOrCreateChat();
        }, 100);
    };

    // Функция отправки сообщения
    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!message.trim() || !currentChatId) return;

        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`/api/chats/${currentChatId}/messages`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ content: message })
            });

            if (response.ok) {
                const newMessage = await response.json();
                setChatMessages(prev => [...prev, newMessage]);
                setMessage('');
            } else {
                console.error('Failed to send message');
            }
        } catch (error) {
            console.error('Error sending message:', error);
        }
    };

    // Функция для форматирования времени
    const formatMessageTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('ru-RU', {
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Загрузка...</h2>
                </div>
            </div>
        );
    }

    if (!apartment) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Объявление не найдено</h2>
                    <Link href="/results" className="text-blue-600 hover:underline">
                        Вернуться к поиску
                    </Link>
                </div>
            </div>
        );
    }

    const hasDiscount = apartment.originalPrice && apartment.originalPrice !== apartment.price;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Хедер */}
            <header className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <Link href="/" className="text-2xl font-bold text-green-600">
                            СъёмБронь
                        </Link>
                        <button
                            onClick={() => router.push('/results')}
                            className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            ← Назад к поиску
                        </button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Левая колонка - фотографии */}
                    <div className="space-y-4">
                        {/* Основное фото */}
                        <div className="relative bg-white rounded-xl shadow-lg overflow-hidden">
                            {apartment.images && apartment.images.length > 0 ? (
                                <>
                                    <div className="relative h-96 lg:h-[500px]">
                                        <Image
                                            src={apartment.images[currentImageIndex]}
                                            alt={apartment.title}
                                            fill
                                            className="object-cover"
                                            priority
                                        />
                                    </div>

                                    {/* Навигация фото */}
                                    {apartment.images.length > 1 && (
                                        <>
                                            <button
                                                onClick={prevImage}
                                                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                                            >
                                                ←
                                            </button>
                                            <button
                                                onClick={nextImage}
                                                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                                            >
                                                →
                                            </button>

                                            {/* Индикаторы */}
                                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                                                {apartment.images.map((_, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => setcurrentImageIndex(index)}
                                                        className={`w-3 h-3 rounded-full transition-all ${index === currentImageIndex
                                                            ? 'bg-white'
                                                            : 'bg-white/50'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="h-96 lg:h-[500px] bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-500">Нет фотографий</span>
                                </div>
                            )}
                        </div>

                        {/* Миниатюры */}
                        {apartment.images && apartment.images.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {apartment.images.map((photo, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setcurrentImageIndex(index)}
                                        className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all ${index === currentImageIndex
                                            ? 'border-green-500'
                                            : 'border-transparent'
                                            }`}
                                    >
                                        <Image
                                            src={photo}
                                            alt={`${apartment.title} ${index + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Правая колонка - информация */}
                    <div className="space-y-6">
                        {/* Заголовок и цена */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                {apartment.title}
                            </h1>
                            <p className="text-gray-600 mb-4">{apartment.address}</p>

                            <div className="flex items-center space-x-4 mb-4">
                                <span className="text-3xl font-bold text-green-600">
                                    {apartment.price}
                                </span>
                                {hasDiscount && (
                                    <>
                                        <span className="text-xl text-gray-500 line-through">
                                            {apartment.originalPrice}
                                        </span>
                                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-medium">
                                            Скидка
                                        </span>
                                    </>
                                )}
                                <span className="text-gray-500">/ сутки</span>
                            </div>

                            {/* Кнопки действий */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <button
                                    onClick={handleCall}
                                    className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                                >
                                    <span>📞</span>
                                    <span>Позвонить</span>
                                </button>

                                <button
                                    onClick={() => setShowBookingModal(true)}
                                    className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                                >
                                    <span>🏨</span>
                                    <span>Забронировать</span>
                                </button>

                                <button
                                    onClick={handleOpenChat}
                                    className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                                >
                                    <span>💬</span>
                                    <span>Чат</span>
                                </button>

                                <button
                                    onClick={() => router.push('/results')}
                                    className="bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                                >
                                    <span>🔍</span>
                                    <span>Искать другие</span>
                                </button>
                            </div>
                        </div>

                        {/* Описание */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold mb-4">Описание</h2>
                            <p className="text-gray-700 leading-relaxed">
                                {apartment.description}
                            </p>
                        </div>

                        {/* Характеристики */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold mb-4">Характеристики</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Тип:</span>
                                    <span className="font-medium">
                                        {apartment.type === 'apartment' ? 'Квартира' :
                                            apartment.type === 'house' ? 'Дом' : 'Студия'}
                                    </span>
                                </div>
                                {apartment.rooms && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Комнат:</span>
                                        <span className="font-medium">{apartment.rooms}</span>
                                    </div>
                                )}
                                {apartment.area && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Площадь:</span>
                                        <span className="font-medium">{apartment.area} м²</span>
                                    </div>
                                )}
                                {apartment.floor && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Этаж:</span>
                                        <span className="font-medium">{apartment.floor}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Район:</span>
                                    <span className="font-medium">{apartment.district}</span>
                                </div>
                            </div>
                        </div>

                        {/* Удобства */}
                        {apartment.amenities && apartment.amenities.length > 0 && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-bold mb-4">Удобства</h2>
                                <div className="grid grid-cols-2 gap-2">
                                    {apartment.amenities.map((amenity, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                            <span className="text-green-500">✓</span>
                                            <span>{amenity}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Хозяин */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold mb-4">Хозяин</h2>
                            <Link href={`/profile/${apartment.hostId}`}>
                                <div className="flex items-center space-x-4 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                                    <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                                        <span className="text-lg">👤</span>
                                    </div>
                                    <div>
                                        <div className="font-semibold text-blue-600 hover:text-blue-800">
                                            {apartment.hostName || 'Неизвестно'}
                                        </div>
                                        <div className="flex items-center space-x-1 text-sm text-gray-600">
                                            <span>⭐ {apartment.hostRating || '4.8'}</span>
                                            <span>•</span>
                                            <span>В сети 2 часа назад</span>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            {/* Чат (модальное окно) */}
            {showChat && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl h-[600px] flex flex-col">
                        {/* Header чата */}
                        <div className="p-4 border-b flex justify-between items-center">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                                    {apartment.hostName?.charAt(0).toUpperCase() || 'Х'}
                                </div>
                                <div>
                                    <h3 className="text-lg font-semibold">Чат с {apartment.hostName || 'хозяином'}</h3>
                                    <p className="text-sm text-green-600">● В сети</p>
                                </div>
                            </div>
                            <button
                                onClick={() => {
                                    setShowChat(false);
                                    setChatMessages([]);
                                    setCurrentChatId(null);
                                }}
                                className="text-gray-500 hover:text-gray-700 text-xl"
                            >
                                ✕
                            </button>
                        </div>

                        {/* Сообщения */}
                        <div className="flex-1 p-4 overflow-y-auto space-y-4">
                            {chatMessages.length === 0 ? (
                                <div className="text-center text-gray-500 mt-8">
                                    Начните общение с {apartment.hostName || 'хозяином'}
                                </div>
                            ) : (
                                chatMessages.map((msg) => (
                                    <div
                                        key={msg.id}
                                        className={`flex ${msg.senderId === user?.id ? 'justify-end' : 'justify-start'}`}
                                    >
                                        <div
                                            className={`max-w-xs lg:max-w-md px-4 py-2 rounded-2xl ${msg.senderId === user?.id
                                                ? 'bg-blue-500 text-white rounded-br-none'
                                                : 'bg-gray-200 text-gray-900 rounded-bl-none'
                                                }`}
                                        >
                                            <p className="text-sm">{msg.content}</p>
                                            <p
                                                className={`text-xs mt-1 ${msg.senderId === user?.id ? 'text-blue-100' : 'text-gray-500'
                                                    }`}
                                            >
                                                {formatMessageTime(msg.createdAt)}
                                            </p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Форма отправки */}
                        <form onSubmit={handleSendMessage} className="p-4 border-t">
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Напишите сообщение..."
                                    className="flex-1 border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500"
                                />
                                <button
                                    type="submit"
                                    disabled={!message.trim() || !currentChatId}
                                    className="bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
                                >
                                    Отправить
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Модальное окно бронирования */}
            {showBookingModal && apartment && (
                <BookingModal
                    apartmentId={apartment.id}
                    apartmentTitle={apartment.title}
                    hostId={apartment.hostId}
                    isOpen={showBookingModal}
                    onClose={() => setShowBookingModal(false)}
                />
            )}
        </div>
    );
}
