'use client';

import { useState } from 'react';
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
    onClose
}: BookingModalProps) {
    const { user } = useAuth();
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [totalPrice, setTotalPrice] = useState<number>(0);
    const [comment, setComment] = useState<string>('');
    const [loading, setLoading] = useState(false);

    const handleDatesChange = (start: Date | null, end: Date | null, price: number) => {
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
            // 1. Создаем бронирование
            const bookingResponse = await fetch('/api/bookings', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: JSON.stringify({
                    apartmentId,
                    userId: user.id,
                    startDate: startDate.toISOString().split('T')[0],
                    endDate: endDate.toISOString().split('T')[0],
                    totalPrice,
                    comment
                })
            });

            if (!bookingResponse.ok) {
                const error = await bookingResponse.json();
                throw new Error(error.error || 'Ошибка при создании бронирования');
            }

            const booking = await bookingResponse.json();

            // 2. Проверяем/создаем чат
            const chatResponse = await fetch('/api/chats/check', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: JSON.stringify({
                    apartmentId,
                    tenantId: user.id,
                    hostId
                })
            });

            if (!chatResponse.ok) {
                throw new Error('Ошибка при создании чата');
            }

            const chat = await chatResponse.json();

            // 3. Отправляем сообщение с деталями бронирования
            const messageResponse = await fetch(`/api/chats/${chat.id}/messages`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('auth_token')}`
                },
                body: JSON.stringify({
                    content: `Новая заявка на бронирование с ${startDate.toLocaleDateString()} по ${endDate.toLocaleDateString()}. Стоимость: ${totalPrice} ₽. Комментарий: ${comment || 'без комментария'}`,
                    senderId: user.id,
                    bookingId: booking.id
                })
            });

            alert('Заявка на бронирование отправлена! Обсудите детали в чате.');
            onClose();

            // Перенаправляем в чат
            window.location.href = `/chats/${chat.id}`;

        } catch (error: any) {
            console.error('Booking error:', error);
            alert(error.message || 'Ошибка при бронировании. Попробуйте еще раз.');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b">
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold">Забронировать</h2>
                            <p className="text-gray-600">{apartmentTitle}</p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 text-2xl"
                        >
                            ×
                        </button>
                    </div>
                </div>

                <div className="p-6">
                    <div className="grid md:grid-cols-2 gap-8">
                        {/* Календарь */}
                        <div>
                            <BookingCalendar
                                apartmentId={apartmentId}
                                onDatesChange={handleDatesChange}
                            />
                        </div>

                        {/* Форма бронирования */}
                        <div className="space-y-6">
                            {startDate && endDate && (
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <h3 className="font-semibold text-lg mb-4">Итоговая информация</h3>

                                    <div className="space-y-3">
                                        <div className="flex justify-between">
                                            <span>Стоимость бронирования:</span>
                                            <span className="font-bold text-xl">{totalPrice} ₽</span>
                                        </div>

                                        <div className="text-sm text-gray-600">
                                            <p>После отправки заявки владелец свяжется с вами в чате для подтверждения.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Комментарий */}
                            <div>
                                <label className="block text-sm font-medium mb-2">
                                    Комментарий для владельца (необязательно)
                                </label>
                                <textarea
                                    value={comment}
                                    onChange={(e) => setComment(e.target.value)}
                                    placeholder="Укажите время заезда, особые пожелания..."
                                    className="w-full h-32 px-3 py-2 border rounded-md resize-none"
                                    maxLength={500}
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    {comment.length}/500 символов
                                </p>
                            </div>

                            {/* Кнопки */}
                            <div className="flex gap-3 pt-4">
                                <button
                                    onClick={onClose}
                                    className="flex-1 px-4 py-3 border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Отмена
                                </button>
                                <button
                                    onClick={handleBooking}
                                    disabled={!startDate || !endDate || loading}
                                    className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <span className="flex items-center justify-center">
                                            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                                            Отправка...
                                        </span>
                                    ) : (
                                        'Отправить заявку на бронирование'
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}