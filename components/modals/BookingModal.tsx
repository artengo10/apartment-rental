'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { useAuth } from '@/context/AuthContext';

// Динамически импортируем календарь
const BookingCalendar = dynamic(
    () => import('@/components/Calendar/BookingCalendar'),
    { ssr: false }
);

interface BookingModalProps {
    apartmentId: number;
    apartmentTitle: string;
    hostId: number;
    isOpen: boolean;
    onClose: () => void;
}

export default function BookingModal({
    apartmentId,
    apartmentTitle,
    hostId,
    isOpen,
    onClose,
}: BookingModalProps) {
    const { user } = useAuth();
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [comment, setComment] = useState<string>('');
    const [loading, setLoading] = useState(false);

    // Блокируем скролл body при открытии модалки
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden';
            document.body.style.position = 'fixed';
            document.body.style.width = '100%';
        } else {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        }

        return () => {
            document.body.style.overflow = '';
            document.body.style.position = '';
            document.body.style.width = '';
        };
    }, [isOpen]);

    const handleDatesChange = (
        start: Date | null,
        end: Date | null,
        price: number
    ) => {
        setStartDate(start);
        setEndDate(end);
        setTotalPrice(price);
    };

    const handleBooking = async () => {
        if (!startDate || !endDate) {
            alert('Выберите даты бронирования');
            return;
        }

        if (!user) {
            alert('Пожалуйста, войдите в систему для бронирования');
            return;
        }

        setLoading(true);
        try {
            const bookingResponse = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
                },
                body: JSON.stringify({
                    apartmentId,
                    userId: user.id,
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: endDate.toISOString().split('T')[0],
                    totalPrice,
                    comment,
                }),
            });

            if (!bookingResponse.ok) {
                const error = await bookingResponse.json();
                throw new Error(error.error || 'Ошибка при создании бронирования');
            }

            const booking = await bookingResponse.json();

            const chatResponse = await fetch('/api/chats/check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
                },
                body: JSON.stringify({
                    apartmentId,
                    tenantId: user.id,
                    hostId,
                }),
            });

            if (!chatResponse.ok) {
                throw new Error('Ошибка при создании чата');
            }

            const chat = await chatResponse.json();

            const messageResponse = await fetch(`/api/chats/${chat.id}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${localStorage.getItem('auth_token')}`,
                },
                body: JSON.stringify({
                    content: `Новая заявка на бронирование с ${startDate.toLocaleDateString()} по ${endDate.toLocaleDateString()}. Стоимость: ${totalPrice} ₽. Комментарий: ${comment || 'без комментария'}`,
                    senderId: user.id,
                    bookingId: booking.id,
                }),
            });

            alert('Заявка на бронирование отправлена! Обсудите детали в чате.');
            onClose();
            window.location.href = `/chats/${chat.id}`;
        } catch (error: any) {
            console.error('Booking error:', error);
            alert(error.message || 'Ошибка при бронировании. Попробуйте еще раз.');
        } finally {
            setLoading(false);
        }
    };

    // Закрытие при нажатии на ESC
    useEffect(() => {
        const handleEsc = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };
        document.addEventListener('keydown', handleEsc);
        return () => document.removeEventListener('keydown', handleEsc);
    }, [onClose]);

    if (!isOpen) return null;

    return (
        <>
            {/* Затемнение фона - такой же как в модалках Sidebar */}
            <div
                className="fixed inset-0 bg-black bg-opacity-70 z-[10000]"
                onClick={onClose}
            />

            {/* Модальное окно - такой же стиль как в AddApartmentModal */}
            <div className="fixed inset-0 flex items-center justify-center z-[10001] p-4">
                <div
                    className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Заголовок */}
                    <div className="sticky top-0 bg-white border-b px-6 py-4 z-10 flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900">Забронировать</h2>
                            <p className="text-gray-600 text-sm mt-1 truncate max-w-md">
                                {apartmentTitle}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-2xl"
                            aria-label="Закрыть"
                        >
                            ×
                        </button>
                    </div>

                    {/* Содержимое */}
                    <div className="overflow-y-auto max-h-[calc(90vh-80px)]">
                        <div className="p-6">
                            <div className="grid lg:grid-cols-2 gap-8">
                                {/* Левая часть - календарь */}
                                <div>
                                    <div className="mb-6">
                                        <h3 className="text-lg font-semibold mb-2">Выберите даты</h3>
                                        <p className="text-gray-600 text-sm">
                                            Отметьте даты заезда и выезда на календаре
                                        </p>
                                    </div>
                                    <div className="border rounded-lg p-4">
                                        <BookingCalendar
                                            apartmentId={apartmentId}
                                            onDatesChange={handleDatesChange}
                                        />
                                    </div>
                                </div>

                                {/* Правая часть - форма */}
                                <div className="space-y-6">
                                    {startDate && endDate && (
                                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-5">
                                            <h3 className="font-semibold text-lg mb-4">Итоговая информация</h3>

                                            <div className="space-y-4">
                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-700">Период:</span>
                                                    <span className="font-medium bg-white px-3 py-1 rounded">
                                                        {startDate.toLocaleDateString('ru-RU')} - {endDate.toLocaleDateString('ru-RU')}
                                                    </span>
                                                </div>

                                                <div className="flex justify-between items-center">
                                                    <span className="text-gray-700">Итоговая стоимость:</span>
                                                    <span className="font-bold text-2xl text-blue-600">
                                                        {totalPrice} ₽
                                                    </span>
                                                </div>

                                                <div className="text-sm text-gray-600 bg-white/70 p-3 rounded border">
                                                    <p className="font-medium">📞 Что дальше?</p>
                                                    <p className="mt-1">
                                                        После отправки заявки владелец свяжется с вами в чате
                                                        для подтверждения бронирования и обсуждения деталей.
                                                    </p>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {/* Комментарий */}
                                    <div>
                                        <label className="block text-sm font-medium mb-3">
                                            Комментарий для владельца <span className="text-gray-500">(необязательно)</span>
                                        </label>
                                        <textarea
                                            value={comment}
                                            onChange={(e) => setComment(e.target.value)}
                                            placeholder="Например: время заезда, особые пожелания, вопросы по оплате..."
                                            className="w-full h-32 px-4 py-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            maxLength={500}
                                        />
                                        <div className="flex justify-between items-center mt-2">
                                            <span className="text-xs text-gray-500">
                                                {comment.length}/500 символов
                                            </span>
                                            <span className="text-xs text-blue-600">
                                                ✨ Можно уточнить позже в чате
                                            </span>
                                        </div>
                                    </div>

                                    {/* Кнопки */}
                                    <div className="flex flex-col sm:flex-row gap-3 pt-4">
                                        <button
                                            onClick={onClose}
                                            className="flex-1 px-6 py-3.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium transition-colors"
                                        >
                                            Отмена
                                        </button>
                                        <button
                                            onClick={handleBooking}
                                            disabled={!startDate || !endDate || loading}
                                            className="flex-1 bg-blue-600 text-white py-3.5 px-6 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors shadow-lg hover:shadow-xl"
                                        >
                                            {loading ? (
                                                <span className="flex items-center justify-center">
                                                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                                    Отправка заявки...
                                                </span>
                                            ) : (
                                                'Отправить заявку на бронирование'
                                            )}
                                        </button>
                                    </div>

                                    {!user && (
                                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                            <p className="text-sm text-yellow-800">
                                                ⚠️ Для бронирования необходимо войти в систему
                                            </p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}