'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import dynamic from 'next/dynamic';

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
}

export default function PriceCalendarPage() {
    const { id } = useParams();
    const router = useRouter();
    const { user } = useAuth();
    const [apartment, setApartment] = useState<Apartment | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (id && user) {
            loadApartment();
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
        } catch (error) {
            console.error('Ошибка загрузки квартиры:', error);
            setError('Не удалось загрузить информацию о квартире');
        } finally {
            setLoading(false);
        }
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
                {/* Хлебные крошки */}
                <nav className="mb-6">
                    <ol className="flex items-center space-x-2 text-sm">
                        <li>
                            <button
                                onClick={() => router.push('/my-apartments')}
                                className="text-gray-600 hover:text-gray-900"
                            >
                                Мои объявления
                            </button>
                        </li>
                        <li className="text-gray-400">/</li>
                        <li className="font-medium text-gray-900">Календарь цен</li>
                    </ol>
                </nav>

                {/* Заголовок */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">
                        Календарь цен: <span className="text-blue-600">{apartment.title}</span>
                    </h1>
                    <p className="mt-2 text-gray-600">
                        Управляйте ценами на разные даты. Базовая цена: <span className="font-semibold">{apartment.price} ₽</span> за ночь.
                    </p>
                </div>

                {/* Компонент календаря */}
                <div className="bg-white rounded-xl shadow-sm p-6">
                    <OwnerPriceCalendar
                        apartmentId={apartment.id}
                        basePrice={apartment.price}
                    />
                </div>

                {/* Подсказки */}
                <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-blue-50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-blue-500 rounded-full mr-2"></div>
                            <span className="font-medium">Сегодня</span>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">Выделен синим цветом</p>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-yellow-500 rounded-full mr-2"></div>
                            <span className="font-medium">Особая цена</span>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">Цена отличается от базовой</p>
                    </div>

                    <div className="bg-red-50 p-4 rounded-lg">
                        <div className="flex items-center">
                            <div className="w-3 h-3 bg-red-500 rounded-full mr-2"></div>
                            <span className="font-medium">Забронировано</span>
                        </div>
                        <p className="mt-2 text-sm text-gray-600">Дата недоступна для изменения</p>
                    </div>
                </div>
            </div>
        </div>
    );
}
