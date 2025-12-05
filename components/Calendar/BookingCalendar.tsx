'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { format, addDays, addMonths, isSameDay, differenceInDays } from 'date-fns';
import { ru } from 'date-fns/locale';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface BookingCalendarProps {
    apartmentId: number;
    onDatesChange: (start: Date | null, end: Date | null, totalPrice: number) => void;
    initialStartDate?: Date | null;
    initialEndDate?: Date | null;
    minNights?: number;
    maxNights?: number;
    className?: string;
}

interface PricingRule {
    id: number;
    date: string;
    price: number;
    type: 'BASE' | 'SPECIAL';
}

interface CalendarData {
    pricingRules: PricingRule[];
    bookedDates: string[];
    basePrice: number;
    minNights: number;
    maxNights: number;
}

export default function BookingCalendar({
    apartmentId,
    onDatesChange,
    initialStartDate = null,
    initialEndDate = null,
    minNights = 1,
    maxNights = 30,
    className = ''
}: BookingCalendarProps) {
    const [startDate, setStartDate] = useState<Date | null>(initialStartDate);
    const [endDate, setEndDate] = useState<Date | null>(initialEndDate);
    const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);
    const [bookedDates, setBookedDates] = useState<string[]>([]);
    const [basePrice, setBasePrice] = useState<number>(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [currentMonth, setCurrentMonth] = useState(new Date());
    const [isMobile, setIsMobile] = useState(false);
    const [totalNights, setTotalNights] = useState(0);
    const [totalPrice, setTotalPrice] = useState(0);
    const calendarRef = useRef<HTMLDivElement>(null);

    // Используем useMemo для today, чтобы он не пересоздавался при каждом рендере
    const today = useMemo(() => {
        const date = new Date();
        date.setHours(0, 0, 0, 0);
        return date;
    }, []);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        fetchCalendarData();
    }, [apartmentId]);

    useEffect(() => {
        if (startDate && endDate) {
            const nights = differenceInDays(endDate, startDate);
            setTotalNights(nights);
            calculateTotalPrice(startDate, endDate);
        } else {
            setTotalNights(0);
            setTotalPrice(0);
            onDatesChange(null, null, 0);
        }
    }, [startDate, endDate, pricingRules, basePrice]);

    const fetchCalendarData = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch(`/api/apartments/${apartmentId}/pricing`);

            if (!response.ok) {
                throw new Error('Ошибка загрузки данных календаря');
            }

            const data: CalendarData = await response.json();

            setPricingRules(data.pricingRules || []);
            setBookedDates(data.bookedDates || []);
            setBasePrice(data.basePrice || 0);

        } catch (error) {
            console.error('Error loading calendar data:', error);
            setError('Не удалось загрузить данные календаря');
        } finally {
            setLoading(false);
        }
    };

    const getPriceForDate = (date: Date): number => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const rule = pricingRules.find(r => {
            const ruleDate = format(new Date(r.date), 'yyyy-MM-dd');
            return ruleDate === dateStr;
        });
        return rule ? rule.price : basePrice;
    };

    const calculateTotalPrice = (start: Date, end: Date) => {
        let total = 0;
        const current = new Date(start);

        while (current < end) {
            total += getPriceForDate(current);
            current.setDate(current.getDate() + 1);
        }

        setTotalPrice(total);
        onDatesChange(start, end, total);
    };

    const handleDateChange = (dates: [Date | null, Date | null]) => {
        const [start, end] = dates;

        // Проверяем минимальное и максимальное количество ночей
        if (start && end) {
            const nights = differenceInDays(end, start);

            if (nights < minNights) {
                const newEnd = addDays(start, minNights);
                setEndDate(newEnd);
                calculateTotalPrice(start, newEnd);
                return;
            }

            if (nights > maxNights) {
                const newEnd = addDays(start, maxNights);
                setEndDate(newEnd);
                calculateTotalPrice(start, newEnd);
                return;
            }
        }

        setStartDate(start);
        setEndDate(end);
    };

    const isDateBooked = (date: Date): boolean => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return bookedDates.some(bookedDate => {
            const bookedDateStr = format(new Date(bookedDate), 'yyyy-MM-dd');
            return bookedDateStr === dateStr;
        });
    };

    const hasSpecialPrice = (date: Date): boolean => {
        const dateStr = format(date, 'yyyy-MM-dd');
        const rule = pricingRules.find(r => {
            const ruleDate = format(new Date(r.date), 'yyyy-MM-dd');
            return ruleDate === dateStr;
        });
        return !!rule && rule.price !== basePrice;
    };

    const getDateClassName = (date: Date) => {
        const isBooked = isDateBooked(date);
        const isSelected = startDate && endDate && date >= startDate && date < endDate;
        const isStart = startDate && isSameDay(date, startDate);
        const isEnd = endDate && isSameDay(date, endDate);
        const isToday = isSameDay(date, new Date());

        let className = "date-cell ";

        if (isBooked) className += "booked ";
        if (isStart) className += "start-date ";
        if (isEnd) className += "end-date ";
        if (isSelected && !isStart && !isEnd) className += "in-range ";
        if (isToday) className += "today ";
        if (hasSpecialPrice(date)) className += "special-price ";

        return className.trim();
    };

    const renderDayContents = (day: number, date: Date) => {
        const isBooked = isDateBooked(date);
        const isSpecial = hasSpecialPrice(date);
        const price = getPriceForDate(date);
        const isSelected = startDate && endDate && date >= startDate && date < endDate;
        const isStart = startDate && isSameDay(date, startDate);
        const isEnd = endDate && isSameDay(date, endDate);
        const isToday = isSameDay(date, new Date());

        return (
            <div className={`
                relative flex flex-col items-center justify-center
                ${isMobile ? 'h-10 py-1 px-0.5' : 'h-14 py-2 px-1'}
                ${isBooked ? 'cursor-not-allowed' : 'cursor-pointer'}
                transition-all duration-200
            `}>
                {/* Номер дня */}
                <div className={`
                    ${isMobile ? 'text-xs' : 'text-sm'} 
                    font-medium mb-0.5
                    ${isStart || isEnd ? 'text-white' :
                        isSelected ? 'text-blue-600' :
                            isToday ? 'text-blue-600' :
                                'text-gray-900'}
                `}>
                    {day}
                </div>

                {/* Цена */}
                <div className={`
                    ${isMobile ? 'text-[9px] px-0.5' : 'text-xs px-1'} 
                    py-0.5 rounded w-full text-center truncate font-medium
                    ${isBooked ? 'bg-red-100 text-red-700' :
                        isSpecial ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'}
                    ${(isStart || isEnd) ? '!bg-white/20 !text-white' : ''}
                `}>
                    {isBooked ? (isMobile ? '❌' : 'Занято') : `${price} ₽`}
                </div>

                {/* Индикаторы для выбранных дат */}
                {(isStart || isEnd) && (
                    <div className="absolute -top-1 -right-1 w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
            </div>
        );
    };

    // ИСПРАВЛЕННАЯ ФУНКЦИЯ - теперь сравниваем Date с Date
    const filterDates = (date: Date) => {
        // Не позволяем выбирать прошедшие даты
        // Используем сегодняшнюю дату с обнуленным временем
        const todayDate = new Date();
        todayDate.setHours(0, 0, 0, 0);

        if (date < todayDate) {
            return false;
        }

        // Не позволяем выбирать забронированные даты
        if (isDateBooked(date)) {
            return false;
        }

        return true;
    };

    const handlePrevMonth = () => {
        const prevMonth = new Date(currentMonth);
        prevMonth.setMonth(prevMonth.getMonth() - 1);
        setCurrentMonth(prevMonth);
    };

    const handleNextMonth = () => {
        const nextMonth = new Date(currentMonth);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        setCurrentMonth(nextMonth);
    };

    const handleResetSelection = () => {
        setStartDate(null);
        setEndDate(null);
        setTotalNights(0);
        setTotalPrice(0);
        onDatesChange(null, null, 0);
    };

    if (loading) {
        return (
            <div className={`bg-white rounded-xl shadow-sm border p-4 md:p-6 ${className}`}>
                <div className="text-center py-8">
                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-4 text-sm md:text-base">Загрузка календаря...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`bg-white rounded-xl shadow-sm border p-4 md:p-6 ${className}`}>
                <div className="text-center py-8">
                    <div className="text-red-500 text-4xl mb-4">⚠️</div>
                    <p className="text-red-600 mb-4">{error}</p>
                    <button
                        onClick={fetchCalendarData}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm"
                    >
                        Попробовать снова
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-xl shadow-sm border ${className}`}>
            {/* Заголовок и информация */}
            <div className="p-4 md:p-6 border-b">
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <h3 className="text-lg md:text-xl font-bold text-gray-900 mb-2">
                            Выберите даты проживания
                        </h3>
                        <p className="text-sm text-gray-600">
                            {startDate && endDate
                                ? `${format(startDate, 'dd.MM.yyyy')} - ${format(endDate, 'dd.MM.yyyy')}`
                                : 'Выберите дату заезда и выезда'
                            }
                        </p>
                    </div>

                    {startDate && endDate && (
                        <button
                            onClick={handleResetSelection}
                            className="text-sm text-gray-500 hover:text-gray-700 flex items-center gap-1"
                        >
                            <span>Сбросить</span>
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </button>
                    )}
                </div>

                {/* Информация о выборе */}
                {startDate && endDate && (
                    <div className="bg-blue-50 rounded-lg p-3 md:p-4">
                        <div className="grid grid-cols-2 gap-3 md:gap-4">
                            <div>
                                <p className="text-xs text-gray-600 mb-1">Ночей:</p>
                                <p className="text-lg font-bold text-gray-900">{totalNights}</p>
                            </div>
                            <div>
                                <p className="text-xs text-gray-600 mb-1">Итого:</p>
                                <p className="text-lg font-bold text-green-600">{totalPrice.toLocaleString()} ₽</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-xs text-gray-600 mb-1">Стоимость за ночь:</p>
                                <div className="flex items-center gap-2">
                                    <span className="text-sm font-medium">{basePrice.toLocaleString()} ₽</span>
                                    {totalPrice / totalNights !== basePrice && (
                                        <span className="text-xs text-yellow-600 bg-yellow-100 px-2 py-0.5 rounded-full">
                                            Особые цены применены
                                        </span>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Календарь */}
            <div className="p-2 md:p-4">
                {/* Навигация по месяцам (мобильная) */}
                <div className="lg:hidden flex items-center justify-between mb-4 px-2">
                    <button
                        onClick={handlePrevMonth}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                        disabled={currentMonth <= new Date()}
                    >
                        <ChevronLeft className="w-5 h-5 text-gray-600" />
                    </button>

                    <h4 className="font-semibold text-gray-900">
                        {currentMonth.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                    </h4>

                    <button
                        onClick={handleNextMonth}
                        className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                    >
                        <ChevronRight className="w-5 h-5 text-gray-600" />
                    </button>
                </div>

                {/* Календарь */}
                <div ref={calendarRef}>
                    <DatePicker
                        selected={startDate}
                        onChange={handleDateChange}
                        startDate={startDate}
                        endDate={endDate}
                        selectsRange
                        inline
                        locale={ru}
                        minDate={new Date()}
                        maxDate={addMonths(new Date(), 12)}
                        filterDate={filterDates}
                        dayClassName={() => "p-0"}
                        renderDayContents={renderDayContents}
                        calendarClassName="w-full border-0"
                        className="w-full"
                        disabledKeyboardNavigation
                        monthsShown={isMobile ? 1 : 2}
                        onMonthChange={setCurrentMonth}
                        renderCustomHeader={({
                            date,
                            decreaseMonth,
                            increaseMonth,
                            prevMonthButtonDisabled,
                            nextMonthButtonDisabled,
                        }) => (
                            <div className="hidden lg:flex items-center justify-between mb-4 px-2">
                                <button
                                    onClick={decreaseMonth}
                                    disabled={prevMonthButtonDisabled}
                                    className="p-2 rounded-full hover:bg-gray-100 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <ChevronLeft className="w-5 h-5 text-gray-600" />
                                </button>

                                <div className="flex gap-4">
                                    <h4 className="font-semibold text-gray-900">
                                        {date.toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                                    </h4>
                                    <h4 className="font-semibold text-gray-900">
                                        {addMonths(date, 1).toLocaleDateString('ru-RU', { month: 'long', year: 'numeric' })}
                                    </h4>
                                </div>

                                <button
                                    onClick={increaseMonth}
                                    disabled={nextMonthButtonDisabled}
                                    className="p-2 rounded-full hover:bg-gray-100 transition-colors"
                                >
                                    <ChevronRight className="w-5 h-5 text-gray-600" />
                                </button>
                            </div>
                        )}
                    />
                </div>

                {/* Легенда */}
                <div className="mt-4 md:mt-6 px-2">
                    <div className="flex flex-wrap gap-3 text-xs text-gray-600">
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 bg-gray-100 rounded border border-gray-300"></div>
                            <span>Доступно</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 bg-yellow-100 rounded border border-yellow-300"></div>
                            <span>Особая цена</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 bg-red-100 rounded border border-red-300"></div>
                            <span>Забронировано</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                            <div className="w-3 h-3 bg-blue-100 rounded border border-blue-300"></div>
                            <span>Выбрано</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Информация о минимальном/максимальном сроке */}
            <div className="p-4 border-t bg-gray-50 rounded-b-xl">
                <div className="text-xs text-gray-600">
                    <p className="mb-1">• Минимальный срок бронирования: {minNights} ночь(ей)</p>
                    <p>• Максимальный срок бронирования: {maxNights} ночей</p>
                </div>
            </div>

            <style jsx>{`
                :global(.react-datepicker) {
                    font-family: inherit;
                    border: none;
                    background: transparent;
                }
                
                :global(.react-datepicker__month-container) {
                    width: 100%;
                }
                
                :global(.react-datepicker__month) {
                    margin: 0;
                }
                
                :global(.react-datepicker__day-names) {
                    display: flex;
                    justify-content: space-around;
                    margin-bottom: 4px;
                }
                
                :global(.react-datepicker__day-name) {
                    width: ${isMobile ? '2rem' : '2.5rem'};
                    height: ${isMobile ? '1.5rem' : '2rem'};
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: ${isMobile ? '0.75rem' : '0.875rem'};
                    color: #6b7280;
                    margin: 0;
                }
                
                :global(.react-datepicker__week) {
                    display: flex;
                    justify-content: space-around;
                    margin-bottom: 2px;
                }
                
                :global(.react-datepicker__day) {
                    width: ${isMobile ? '2rem' : '2.5rem'};
                    height: ${isMobile ? '2.5rem' : '3.5rem'};
                    margin: 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: ${isMobile ? '0.75rem' : '0.875rem'};
                    border-radius: 0.375rem;
                }
                
                :global(.date-cell) {
                    border-radius: 0.375rem;
                }
                
                :global(.date-cell.start-date) {
                    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                    color: white;
                    border-top-right-radius: 0;
                    border-bottom-right-radius: 0;
                }
                
                :global(.date-cell.end-date) {
                    background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                    color: white;
                    border-top-left-radius: 0;
                    border-bottom-left-radius: 0;
                }
                
                :global(.date-cell.in-range) {
                    background-color: #dbeafe;
                }
                
                :global(.date-cell.today) {
                    border: 2px solid #3b82f6;
                }
                
                :global(.date-cell.booked) {
                    opacity: 0.5;
                    cursor: not-allowed;
                }
            `}</style>
        </div>
    );
}