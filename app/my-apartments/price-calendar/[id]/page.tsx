// app/my-apartments/price-calendar/[id]/page.tsx
'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import dynamic from 'next/dynamic';
import { Clock, Save, AlertCircle, Calendar, DollarSign, Home, Users, RefreshCw } from 'lucide-react';

// Динамически загружаем компонент для избежания SSR проблем с DatePicker
const OwnerPriceCalendar = dynamic(
    () => import('@/components/Calendar/OwnerPriceCalendar'),
    { ssr: false }
);

interface Apartment {
    id: number;
    title: string;
    price: number;
    hostId: number;
    checkInTime?: string;
    checkOutTime?: string;
    cleaningTime?: number;
    bookings?: Array<{
        id: number;
        startDate: string;
        endDate: string;
        status: string;
        user: {
            name: string;
        };
    }>;
}

export default function PriceCalendarPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [apartment, setApartment] = useState<Apartment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Настройки времени
    const [checkInTime, setCheckInTime] = useState('14:00');
    const [checkOutTime, setCheckOutTime] = useState('12:00');
    const [cleaningTime, setCleaningTime] = useState(2);
    const [timeError, setTimeError] = useState<string | null>(null);
    const [savingTimeSettings, setSavingTimeSettings] = useState(false);

    // Данные для календаря
    const [bookings, setBookings] = useState<any[]>([]);
    const [pricingRules, setPricingRules] = useState<any[]>([]);
    const [calendarLoading, setCalendarLoading] = useState(false);

    useEffect(() => {
        if (id && user) {
            loadApartment();
            loadCalendarData();
        }
    }, [id, user]);

    const loadApartment = async () => {
        try {
            const response = await fetch(`/api/apartments/${id}`);
            if (!response.ok) {
                throw new Error('Квартира не найдена');
            }
            const data = await response.json();

            // Проверяем, что пользователь - владелец
            if (data.hostId !== user?.id) {
                setError('У вас нет доступа к управлению ценами этой квартиры');
                return;
            }

            setApartment(data);
            // Устанавливаем настройки времени из данных квартиры
            if (data.checkInTime) setCheckInTime(data.checkInTime);
            if (data.checkOutTime) setCheckOutTime(data.checkOutTime);
            if (data.cleaningTime) setCleaningTime(data.cleaningTime);
        } catch (error) {
            console.error('Ошибка загрузки квартиры:', error);
            setError('Не удалось загрузить информацию о квартире');
        } finally {
            setLoading(false);
        }
    };

    const loadCalendarData = async () => {
        try {
            setCalendarLoading(true);
            const token = localStorage.getItem('auth_token');

            // Загружаем бронирования
            const bookingsRes = await fetch(`/api/apartments/${id}/bookings`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (bookingsRes.ok) {
                const bookingsData = await bookingsRes.json();
                setBookings(bookingsData);
            }

            // Загружаем правила ценообразования
            const pricingRes = await fetch(`/api/apartments/${id}/pricing`, {
                headers: { Authorization: `Bearer ${token}` }
            });

            if (pricingRes.ok) {
                const pricingData = await pricingRes.json();
                setPricingRules(pricingData);
            }
        } catch (error) {
            console.error('Ошибка загрузки данных календаря:', error);
        } finally {
            setCalendarLoading(false);
        }
    };

    // Валидация времени заезда/выезда
    useEffect(() => {
        if (checkInTime && checkOutTime) {
            const [checkInHours, checkInMinutes] = checkInTime.split(':').map(Number);
            const [checkOutHours, checkOutMinutes] = checkOutTime.split(':').map(Number);

            const checkInTotal = checkInHours * 60 + checkInMinutes;
            const checkOutTotal = checkOutHours * 60 + checkOutMinutes;

            if (checkInTotal <= checkOutTotal) {
                setTimeError('Время заезда должно быть ПОСЛЕ времени выезда (минимум 1 час разницы)');
            } else if (checkInTotal - checkOutTotal < 60) {
                setTimeError('Минимальное время между выездом и заездом - 1 час для уборки');
            } else {
                setTimeError(null);
                // Автоматически рассчитываем время уборки
                const cleaningMinutes = checkInTotal - checkOutTotal;
                setCleaningTime(Math.ceil(cleaningMinutes / 60));
            }
        }
    }, [checkInTime, checkOutTime]);

    const saveTimeSettings = async () => {
        if (!apartment || timeError) return;

        setSavingTimeSettings(true);
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`/api/apartments/${apartment.id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
                body: JSON.stringify({
                    checkInTime,
                    checkOutTime,
                    cleaningTime,
                }),
            });

            if (!response.ok) {
                throw new Error('Ошибка сохранения');
            }

            // Обновляем состояние квартиры
            setApartment(prev => prev ? {
                ...prev,
                checkInTime,
                checkOutTime,
                cleaningTime,
            } : null);

            alert('Настройки времени сохранены!');
        } catch (error) {
            console.error('Ошибка сохранения:', error);
            alert('Не удалось сохранить настройки времени');
        } finally {
            setSavingTimeSettings(false);
        }
    };

    const refreshCalendar = () => {
        loadCalendarData();
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Загрузка...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center max-w-md">
                    <div className="text-red-500 text-5xl mb-4">⚠️</div>
                    <h2 className="text-xl font-semibold mb-2">{error}</h2>
                    <button
                        onClick={() => router.push('/my-apartments')}
                        className="mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                    >
                        Вернуться к моим объявлениям
                    </button>
                </div>
            </div>
        );
    }

    if (!apartment) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Хлебные крошки и заголовок */}
                <div className="mb-8">
                    <nav className="mb-4">
                        <ol className="flex items-center space-x-2 text-sm">
                            <li>
                                <button
                                    onClick={() => router.push('/my-apartments')}
                                    className="text-gray-600 hover:text-gray-900 flex items-center gap-1"
                                >
                                    <Home className="w-4 h-4" />
                                    Мои объявления
                                </button>
                            </li>
                            <li className="text-gray-400">/</li>
                            <li className="font-medium text-gray-900 flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                Календарь цен
                            </li>
                        </ol>
                    </nav>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900">
                                Календарь цен: <span className="text-blue-600">{apartment.title}</span>
                            </h1>
                            <div className="mt-2 flex flex-wrap items-center gap-4 text-gray-600">
                                <span className="flex items-center gap-1">
                                    <DollarSign className="w-4 h-4" />
                                    Базовая цена: <span className="font-semibold">{apartment.price} ₽/ночь</span>
                                </span>
                                <span className="flex items-center gap-1">
                                    <Users className="w-4 h-4" />
                                    Активных бронирований: <span className="font-semibold">{bookings.length}</span>
                                </span>
                            </div>
                        </div>

                        <button
                            onClick={refreshCalendar}
                            disabled={calendarLoading}
                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 flex items-center gap-2 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 ${calendarLoading ? 'animate-spin' : ''}`} />
                            Обновить данные
                        </button>
                    </div>
                </div>

                {/* Настройки времени */}
                <div className="bg-white rounded-xl shadow-sm p-6 mb-8">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Clock className="w-5 h-5" />
                            Настройки времени заезда и выезда
                        </h2>
                        <button
                            onClick={saveTimeSettings}
                            disabled={savingTimeSettings || !!timeError}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center gap-2"
                        >
                            <Save className="w-4 h-4" />
                            {savingTimeSettings ? 'Сохранение...' : 'Сохранить время'}
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Время выезда
                            </label>
                            <input
                                type="time"
                                value={checkOutTime}
                                onChange={(e) => setCheckOutTime(e.target.value)}
                                className="w-full p-3 border rounded-lg"
                            />
                            <p className="mt-2 text-sm text-gray-500">
                                До этого времени предыдущий гость должен освободить жилье
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Время заезда
                            </label>
                            <input
                                type="time"
                                value={checkInTime}
                                onChange={(e) => setCheckInTime(e.target.value)}
                                className="w-full p-3 border rounded-lg"
                            />
                            <p className="mt-2 text-sm text-gray-500">
                                С этого времени следующий гость может заехать
                            </p>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">
                                Время на уборку
                            </label>
                            <div className="flex items-center gap-2">
                                <div className="flex-1 p-3 border rounded-lg bg-gray-50">
                                    {cleaningTime} часа(ов)
                                </div>
                                <button
                                    onClick={() => setCleaningTime(prev => Math.min(prev + 1, 24))}
                                    className="px-4 py-3 bg-gray-200 rounded-lg hover:bg-gray-300"
                                    type="button"
                                >
                                    +
                                </button>
                                <button
                                    onClick={() => setCleaningTime(prev => Math.max(prev - 1, 1))}
                                    className="px-4 py-3 bg-gray-200 rounded-lg hover:bg-gray-300"
                                    type="button"
                                >
                                    -
                                </button>
                            </div>
                            <p className="mt-2 text-sm text-gray-500">
                                Рассчитывается автоматически из разницы времени
                            </p>
                        </div>
                    </div>

                    {timeError && (
                        <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                            <div>
                                <p className="text-red-800 font-medium">{timeError}</p>
                                <p className="text-red-700 text-sm mt-1">
                                    Рекомендуем установить время заезда минимум на 2 часа позже времени выезда.
                                </p>
                            </div>
                        </div>
                    )}

                    {!timeError && (
                        <div className="p-4 bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 rounded-lg">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div>
                                    <h3 className="font-medium text-gray-900 mb-1">Автоматическое управление временем</h3>
                                    <p className="text-sm text-gray-600">
                                        ✅ Время для уборки: с {checkOutTime} до {checkInTime} ({cleaningTime} час)
                                    </p>
                                </div>

                                <div className="bg-white p-3 rounded-lg border">
                                    <p className="text-sm font-medium text-gray-900">Пример бронирования:</p>
                                    <div className="text-xs text-gray-600 mt-1 space-y-1">
                                        <div>• Гость 1: выезжает до {checkOutTime} 15 января</div>
                                        <div>• Уборка: {cleaningTime} часа ({checkOutTime} - {checkInTime})</div>
                                        <div>• Гость 2: заезжает после {checkInTime} 15 января</div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-4 text-xs text-gray-500">
                                💡 <strong>Преимущество:</strong> Нет "пустых" дней между гостями. Вы не теряете доход!
                            </div>
                        </div>
                    )}
                </div>

                {/* Статистика и быстрые действия */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Активные брони</span>
                            <span className="font-bold text-blue-600">{bookings.length}</span>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">Текущие и будущие</div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Особые цены</span>
                            <span className="font-bold text-yellow-600">{pricingRules.length}</span>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">Установлено дат</div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Время уборки</span>
                            <span className="font-bold text-green-600">{cleaningTime}ч</span>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">Между гостями</div>
                    </div>

                    <div className="bg-white p-4 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-gray-600">Доход за 30 дней</span>
                            <span className="font-bold text-purple-600">
                                {apartment.price * 30 - apartment.price * 2}₽
                            </span>
                        </div>
                        <div className="mt-2 text-xs text-gray-500">Прогноз при 100% заполнении</div>
                    </div>
                </div>

                {/* Компонент календаря */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <div className="flex items-center justify-between mb-6">
                        <h2 className="text-xl font-semibold flex items-center gap-2">
                            <Calendar className="w-5 h-5" />
                            Управление ценами и доступностью
                        </h2>
                        <div className="text-sm text-gray-500">
                            {calendarLoading ? 'Загрузка...' : 'Обновлено только что'}
                        </div>
                    </div>

                    <OwnerPriceCalendar
                        apartmentId={apartment.id}
                        basePrice={apartment.price}
                        checkInTime={checkInTime}
                        checkOutTime={checkOutTime}
                        cleaningTime={cleaningTime}
                        bookings={bookings}
                        pricingRules={pricingRules}
                        onDataChange={loadCalendarData}
                    />
                </div>

                {/* Подсказки и инструкции */}
                <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-200">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            📅 Как работает календарь
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-blue-500 rounded-full mt-1.5"></div>
                                <span><strong>Клик по дате</strong> — установить/изменить цену</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5"></div>
                                <span><strong>Желтые даты</strong> — особые цены</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5"></div>
                                <span><strong>Красные даты</strong> — забронированы</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                                <span><strong>Зеленые даты</strong> — доступны для брони</span>
                            </li>
                        </ul>
                    </div>

                    <div className="bg-gradient-to-br from-green-50 to-emerald-50 p-6 rounded-xl border border-green-200">
                        <h3 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                            ⏰ Оптимальные настройки времени
                        </h3>
                        <ul className="space-y-2 text-sm text-gray-700">
                            <li className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                                <span><strong>Выезд до 12:00</strong> — гости успевают собраться</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                                <span><strong>Заезд с 14:00</strong> — достаточно времени на уборку</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                                <span><strong>2-3 часа на уборку</strong> — оптимально для подготовки</span>
                            </li>
                            <li className="flex items-start gap-2">
                                <div className="w-2 h-2 bg-green-500 rounded-full mt-1.5"></div>
                                <span><strong>Автоматический расчет</strong> — система сама подберет время</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Предупреждение о синхронизации */}
                <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <div className="flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                        <div>
                            <p className="text-yellow-800 font-medium">
                                ⚠️ Все изменения автоматически синхронизируются с бронированиями
                            </p>
                            <p className="text-yellow-700 text-sm mt-1">
                                При изменении времени заезда/выезда система автоматически пересчитает все будущие бронирования.
                                Существующие гости получат уведомление о новых условиях.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
