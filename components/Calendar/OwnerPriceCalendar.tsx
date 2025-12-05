'use client';

import { useState, useEffect, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, isSameDay, addMonths } from 'date-fns';
import { ru } from 'date-fns/locale';

interface OwnerPriceCalendarProps {
    apartmentId: number;
    basePrice: number;
    checkInTime?: string;
    checkOutTime?: string;
    cleaningTime?: number;
    bookings?: any[];
    pricingRules?: any[];
    onDataChange?: () => void;
}

interface PricingRule {
    id: number;
    date: string;
    price: number;
    type: 'BASE' | 'SPECIAL';
}

export default function OwnerPriceCalendar({
    apartmentId,
    basePrice,
    checkInTime = '14:00',
    checkOutTime = '12:00',
    cleaningTime = 2,
    bookings = [],
    pricingRules = [],
    onDataChange
}: OwnerPriceCalendarProps) {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [customPrice, setCustomPrice] = useState<string>('');
    const [loading, setLoading] = useState(false);
    const [month, setMonth] = useState(new Date());
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Преобразуем bookings в массив занятых дат
    const bookedDates = useMemo(() => {
        const dates: Date[] = [];
        bookings.forEach(booking => {
            const start = new Date(booking.startDate);
            const end = new Date(booking.endDate);
            for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                dates.push(new Date(d));
            }
        });
        return dates;
    }, [bookings]);

    // Получить цену на дату
    const getPriceForDate = (date: Date): number => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const rule = pricingRules.find(r => format(new Date(r.date), 'yyyy-MM-dd') === dateStr);
        return rule ? rule.price : basePrice;
    };

    // Проверить, забронирована ли дата
    const isDateBooked = (date: Date): boolean => {
        return bookedDates.some(bookedDate =>
            format(bookedDate, 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        );
    };

    // Показать сообщение
    const showMessage = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        setTimeout(() => setMessage(null), 3000);
    };

    // Установить цену
    const handleSetPrice = async () => {
        if (!selectedDate || !customPrice) return;

        const price = parseFloat(customPrice);
        if (isNaN(price) || price <= 0) {
            showMessage('error', 'Введите корректную цену');
            return;
        }

        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`/api/apartments/${apartmentId}/pricing`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    date: format(selectedDate, 'yyyy-MM-dd'),
                    price: price
                })
            });

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error);
            }

            const updatedRule = await response.json();

            setCustomPrice('');
            showMessage('success', 'Цена успешно обновлена');

            // Обновляем данные в родительском компоненте
            if (onDataChange) {
                onDataChange();
            }
        } catch (error: any) {
            console.error('Ошибка установки цены:', error);
            showMessage('error', error.message || 'Ошибка при сохранении цены');
        } finally {
            setLoading(false);
        }
    };

    // Сбросить цену
    const handleResetPrice = async () => {
        if (!selectedDate) return;

        setLoading(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(
                `/api/apartments/${apartmentId}/pricing?date=${format(selectedDate, 'yyyy-MM-dd')}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Ошибка сброса цены');
            }

            setCustomPrice('');
            showMessage('success', 'Цена сброшена к базовой');

            // Обновляем данные в родительском компоненте
            if (onDataChange) {
                onDataChange();
            }
        } catch (error) {
            console.error('Ошибка сброса цены:', error);
            showMessage('error', 'Ошибка при сбросе цены');
        } finally {
            setLoading(false);
        }
    };

    // Логика для расчета доступных дат с учетом времени уборки
    const calculateAvailableDates = (startDate: Date, endDate: Date) => {
        // Учитываем время уборки между бронированиями
        const adjustedStartDate = new Date(startDate);
        if (bookings.length > 0) {
            // Проверяем, что между бронированиями есть время для уборки
            const lastBooking = bookings[bookings.length - 1];
            const lastBookingEnd = new Date(lastBooking.endDate);
            const cleaningHours = cleaningTime;

            // Добавляем время уборки к дате окончания последнего бронирования
            lastBookingEnd.setHours(lastBookingEnd.getHours() + cleaningHours);

            // Если новый заезд раньше, чем закончится уборка
            if (startDate < lastBookingEnd) {
                adjustedStartDate.setTime(lastBookingEnd.getTime());
            }
        }
        return adjustedStartDate;
    };

    // Визуализация времени в ячейке календаря
    const renderTimeInfo = (date: Date) => {
        const dateStr = date.toISOString().split('T')[0];
        const hasBooking = bookings.some(booking => {
            const bookingStart = new Date(booking.startDate).toISOString().split('T')[0];
            const bookingEnd = new Date(booking.endDate).toISOString().split('T')[0];
            return dateStr >= bookingStart && dateStr <= bookingEnd;
        });

        if (hasBooking) {
            return (
                <div className="text-xs mt-1">
                    <div>Выезд: {checkOutTime}</div>
                    <div>Уборка: {cleaningTime}ч</div>
                </div>
            );
        }

        return (
            <div className="text-xs mt-1 text-gray-500">
                <div>Заезд: {checkInTime}</div>
            </div>
        );
    };

    // Кастомный рендеринг дня
    const renderDayContents = (day: number, date: Date) => {
        const price = getPriceForDate(date);
        const isBooked = isDateBooked(date);
        const isToday = isSameDay(date, new Date());
        const isSpecial = pricingRules.some(r =>
            format(new Date(r.date), 'yyyy-MM-dd') === format(date, 'yyyy-MM-dd')
        );
        const isSelected = selectedDate && isSameDay(date, selectedDate);

        return (
            <div className={`
                relative py-1 px-0.5 ${isMobile ? 'h-12' : 'h-16'} flex flex-col items-center justify-center
                ${isToday ? 'bg-blue-50' : ''}
                ${isSelected ? 'bg-blue-100 ring-1 md:ring-2 ring-blue-500' : ''}
                ${isBooked ? 'bg-red-50 cursor-not-allowed' : 'cursor-pointer'}
                hover:bg-gray-50 rounded-md transition-colors
            `}>
                <div className="text-xs md:text-sm font-medium mb-0.5">{day}</div>
                <div className={`
                    text-[10px] md:text-xs px-0.5 md:px-1 py-0.5 rounded w-full text-center truncate
                    ${isBooked
                        ? 'bg-red-100 text-red-700'
                        : isSpecial
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-600'
                    }
                `}>
                    {isBooked ? (isMobile ? '❌' : 'Занято') : `${isMobile ? '' : ''}${price} ₽`}
                </div>
                {/* Скрыть время на мобилках */}
                {!isMobile && renderTimeInfo(date)}
            </div>
        );
    };

    // ОБНОВИТЬ основную разметку:
    return (
        <div className="max-w-6xl mx-auto px-2 sm:px-4">
            {message && (
                <div className={`mb-4 p-3 md:p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="flex flex-col lg:grid lg:grid-cols-2 gap-4 md:gap-8">
                {/* Календарь */}
                <div className="bg-white rounded-lg border p-2 md:p-4 order-2 lg:order-1">
                    <DatePicker
                        selected={selectedDate}
                        onChange={(date: Date | null) => setSelectedDate(date)}
                        inline
                        locale={ru}
                        minDate={new Date()}
                        maxDate={addMonths(new Date(), 12)}
                        onMonthChange={setMonth}
                        filterDate={(date) => !isDateBooked(date)}
                        dayClassName={() => "p-0"}
                        renderDayContents={renderDayContents}
                        calendarClassName="w-full border-0"
                        className="w-full"
                    />
                </div>

                {/* Панель управления */}
                <div className="bg-white rounded-lg border p-4 md:p-6 order-1 lg:order-2">
                    <h3 className="text-base md:text-lg font-semibold mb-3 md:mb-4">
                        {selectedDate
                            ? `Управление ценой на ${format(selectedDate, 'dd.MM.yyyy')}`
                            : 'Выберите дату для изменения цены'
                        }
                    </h3>

                    {selectedDate ? (
                        <>
                            <div className="space-y-4 mb-6">
                                <div>
                                    <p className="text-sm text-gray-600">Текущая цена:</p>
                                    <p className="text-2xl font-bold">{getPriceForDate(selectedDate)} ₽</p>
                                </div>

                                <div>
                                    <p className="text-sm text-gray-600">Базовая цена:</p>
                                    <p className="text-lg">{basePrice} ₽</p>
                                </div>

                                {isDateBooked(selectedDate) && (
                                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                                        <p className="text-sm text-red-700">
                                            ⚠️ Эта дата забронирована. Изменение цены невозможно.
                                        </p>
                                    </div>
                                )}
                            </div>

                            {!isDateBooked(selectedDate) && (
                                <>
                                    <div className="mb-6">
                                        <label className="block text-sm font-medium mb-2">
                                            Новая цена (₽)
                                        </label>
                                        <input
                                            type="number"
                                            value={customPrice}
                                            onChange={(e) => setCustomPrice(e.target.value)}
                                            placeholder={`${basePrice}`}
                                            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            min="1"
                                            step="100"
                                        />
                                    </div>

                                    <div className="space-y-3">
                                        <button
                                            onClick={handleSetPrice}
                                            disabled={!customPrice || loading}
                                            className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            {loading ? 'Сохранение...' : 'Сохранить цену'}
                                        </button>

                                        {getPriceForDate(selectedDate) !== basePrice && (
                                            <button
                                                onClick={handleResetPrice}
                                                disabled={loading}
                                                className="w-full py-2 px-4 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                            >
                                                Сбросить к базовой цене
                                            </button>
                                        )}
                                    </div>

                                    {/* Быстрые действия */}
                                    <div className="mt-8">
                                        <p className="text-sm font-medium mb-3">Быстрые цены:</p>
                                        <div className="grid grid-cols-2 gap-2">
                                            {[basePrice * 0.8, basePrice, basePrice * 1.2, basePrice * 1.5].map((price) => (
                                                <button
                                                    key={price}
                                                    onClick={() => setCustomPrice(Math.round(price).toString())}
                                                    className="px-3 py-2 bg-gray-50 border rounded-lg hover:bg-gray-100 transition-colors text-sm"
                                                >
                                                    {Math.round(price)} ₽
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}
                        </>
                    ) : (
                        <div className="text-center py-12 text-gray-500">
                            <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <p>Нажмите на день в календаре для изменения цены</p>
                            <p className="text-sm mt-2">Забронированные даты (красные) недоступны для изменения</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
