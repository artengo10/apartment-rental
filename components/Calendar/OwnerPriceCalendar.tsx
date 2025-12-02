'use client';

import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, isSameDay, addMonths } from 'date-fns';
import { ru } from 'date-fns/locale';

interface OwnerPriceCalendarProps {
    apartmentId: number;
    basePrice: number;
}

interface PricingRule {
    id: number;
    date: string;
    price: number;
    type: 'BASE' | 'SPECIAL';
}

export default function OwnerPriceCalendar({ apartmentId, basePrice }: OwnerPriceCalendarProps) {
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [customPrice, setCustomPrice] = useState<string>('');
    const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
    const [bookedDates, setBookedDates] = useState<Date[]>([]);
    const [loading, setLoading] = useState(false);
    const [month, setMonth] = useState(new Date());
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Загрузка данных
    useEffect(() => {
        loadCalendarData();
    }, [apartmentId, month]);

    const loadCalendarData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/apartments/${apartmentId}/pricing`);
            const data = await response.json();
            setPricingRules(data.pricingRules || []);
            setBookedDates(data.bookedDates?.map((d: string) => new Date(d)) || []);
        } catch (error) {
            console.error('Ошибка загрузки данных:', error);
            showMessage('error', 'Не удалось загрузить данные календаря');
        } finally {
            setLoading(false);
        }
    };

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

            // Обновляем локальное состояние
            setPricingRules(prev => {
                const existingIndex = prev.findIndex(r =>
                    format(new Date(r.date), 'yyyy-MM-dd') === format(selectedDate!, 'yyyy-MM-dd')
                );

                if (existingIndex >= 0) {
                    const newRules = [...prev];
                    newRules[existingIndex] = updatedRule;
                    return newRules;
                } else {
                    return [...prev, updatedRule];
                }
            });

            setCustomPrice('');
            showMessage('success', 'Цена успешно обновлена');
        } catch (error: any) {
            console.error('Ошибка установки цены:', error);
            showMessage('error', error.message || 'Ошибка при сохранении цены');
        }
    };

    // Сбросить цену
    const handleResetPrice = async () => {
        if (!selectedDate) return;

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

            // Удаляем из локального состояния
            setPricingRules(prev =>
                prev.filter(r =>
                    format(new Date(r.date), 'yyyy-MM-dd') !== format(selectedDate, 'yyyy-MM-dd')
                )
            );

            setCustomPrice('');
            showMessage('success', 'Цена сброшена к базовой');
        } catch (error) {
            console.error('Ошибка сброса цены:', error);
            showMessage('error', 'Ошибка при сбросе цены');
        }
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
        relative py-2 px-1 h-16 flex flex-col items-center justify-center
        ${isToday ? 'bg-blue-50' : ''}
        ${isSelected ? 'bg-blue-100 ring-2 ring-blue-500' : ''}
        ${isBooked ? 'bg-red-50 cursor-not-allowed' : 'cursor-pointer'}
        hover:bg-gray-50 rounded-md transition-colors
      `}>
                <div className="text-sm font-medium mb-1">{day}</div>
                <div className={`
          text-xs px-1 py-0.5 rounded w-full text-center truncate
          ${isBooked
                        ? 'bg-red-100 text-red-700'
                        : isSpecial
                            ? 'bg-yellow-100 text-yellow-700'
                            : 'bg-gray-100 text-gray-600'
                    }
        `}>
                    {isBooked ? 'Занято' : `${price} ₽`}
                </div>
            </div>
        );
    };

    return (
        <div className="max-w-6xl mx-auto">
            {message && (
                <div className={`mb-4 p-4 rounded-lg ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                    {message.text}
                </div>
            )}

            <div className="grid lg:grid-cols-2 gap-8">
                {/* Календарь */}
                <div className="bg-white rounded-lg border p-4">
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
                <div className="bg-white rounded-lg border p-6">
                    <h3 className="text-lg font-semibold mb-4">
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