'use client';

import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, addDays } from 'date-fns';
import { ru } from 'date-fns/locale';

interface BookingCalendarProps {
    apartmentId: number;
    onDatesChange: (start: Date | null, end: Date | null, totalPrice: number) => void;
}

interface PricingRule {
    id: number;
    date: string;
    price: number;
    type: 'BASE' | 'SPECIAL';
}

export default function BookingCalendar({ apartmentId, onDatesChange }: BookingCalendarProps) {
    const [startDate, setStartDate] = useState<Date | null>(null);
    const [endDate, setEndDate] = useState<Date | null>(null);
    const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
    const [bookedDates, setBookedDates] = useState<string[]>([]);
    const [basePrice, setBasePrice] = useState<number>(0);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        // Загружаем данные о ценах
        fetch(`/api/apartments/${apartmentId}/pricing`)
            .then(res => res.json())
            .then(data => {
                setPricingRules(data.pricingRules || []);
                setBookedDates(data.bookedDates || []);
                setBasePrice(data.basePrice || 0);
                setLoading(false);
            })
            .catch(error => {
                console.error('Error loading pricing:', error);
                setLoading(false);
            });
    }, [apartmentId]);

    useEffect(() => {
        if (startDate && endDate) {
            calculateTotalPrice(startDate, endDate);
        } else {
            onDatesChange(null, null, 0);
        }
    }, [startDate, endDate, pricingRules, basePrice]);
    
    // Получить цену на конкретную дату
    const getPriceForDate = (date: Date): number => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const rule = pricingRules.find(r => {
            const ruleDate = format(new Date(r.date), 'yyyy-MM-dd');
            return ruleDate === dateStr;
        });
        return rule ? rule.price : basePrice;
    };

    // Рассчитать общую стоимость
    const calculateTotalPrice = (start: Date, end: Date) => {
        let totalPrice = 0;
        const current = new Date(start);

        while (current < end) {
            totalPrice += getPriceForDate(current);
            current.setDate(current.getDate() + 1);
        }

        onDatesChange(start, end, totalPrice);
    };

    const handleDateChange = (dates: [Date | null, Date | null]) => {
        const [start, end] = dates;
        setStartDate(start);
        setEndDate(end);
    };

    // Проверить, забронирована ли дата
    const isDateBooked = (date: Date): boolean => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return bookedDates.some(bookedDate => {
            const bookedDateStr = format(new Date(bookedDate), 'yyyy-MM-dd');
            return bookedDateStr === dateStr;
        });
    };

    // Проверить, есть ли специальная цена
    const hasSpecialPrice = (date: Date): boolean => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const rule = pricingRules.find(r => {
            const ruleDate = format(new Date(r.date), 'yyyy-MM-dd');
            return ruleDate === dateStr;
        });
        return !!rule && rule.price !== basePrice;
    };

    // Кастомный рендеринг дня
    const renderDayContents = (day: number, date: Date) => {
        const isBooked = isDateBooked(date);
        const isSpecial = hasSpecialPrice(date);
        const price = getPriceForDate(date);
        const isInRange = startDate && endDate && date >= startDate && date < endDate;
        const isStart = startDate && format(date, 'yyyy-MM-dd') === format(startDate, 'yyyy-MM-dd');
        const isEnd = endDate && format(date, 'yyyy-MM-dd') === format(endDate, 'yyyy-MM-dd');

        return (
            <div className={`
                relative py-2 px-1 h-16 flex flex-col items-center justify-center
                ${isBooked ? 'bg-red-50 cursor-not-allowed' : 'cursor-pointer'}
                ${isStart ? 'bg-blue-100 rounded-l-full' : ''}
                ${isEnd ? 'bg-blue-100 rounded-r-full' : ''}
                ${isInRange ? 'bg-blue-50' : ''}
                hover:bg-gray-50 rounded-md transition-colors
            `}>
                <div className="text-sm font-medium mb-1">{day}</div>
                <div className={`
                    text-xs px-1 py-0.5 rounded w-full text-center truncate
                    ${isBooked ? 'bg-red-100 text-red-700' :
                        isSpecial ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-600'}
                `}>
                    {isBooked ? 'Занято' : `${price} ₽`}
                </div>
            </div>
        );
    };

    // Фильтр дат (исключаем забронированные)
    const filterDates = (date: Date) => {
        return !isDateBooked(date);
    };

    if (loading) {
        return (
            <div className="text-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                <p className="text-gray-500 mt-2">Загрузка календаря...</p>
            </div>
        );
    }

    return (
        <div className="calendar-container">
            <DatePicker
                selected={startDate}
                onChange={handleDateChange}
                startDate={startDate}
                endDate={endDate}
                selectsRange
                inline
                locale={ru}
                minDate={new Date()}
                maxDate={addDays(new Date(), 365)}
                filterDate={filterDates}
                dayClassName={() => "p-0"}
                renderDayContents={renderDayContents}
                calendarClassName="w-full border-0"
                className="w-full"
                disabledKeyboardNavigation
            />

            {/* Легенда */}
            <div className="mt-4 flex flex-wrap gap-3 text-xs">
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-yellow-100 rounded mr-1"></div>
                    <span>Особая цена</span>
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-gray-100 rounded mr-1"></div>
                    <span>Базовая цена</span>
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-red-100 rounded mr-1"></div>
                    <span>Забронировано</span>
                </div>
                <div className="flex items-center">
                    <div className="w-3 h-3 bg-blue-100 rounded mr-1"></div>
                    <span>Выбранные даты</span>
                </div>
            </div>
        </div>
    );
}