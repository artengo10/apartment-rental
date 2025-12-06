// app/favorites/page.tsx - УПРОЩЕННАЯ И АДАПТИВНАЯ ВЕРСИЯ (ИСПРАВЛЕННАЯ)
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';
import Header from '@/components/Header';
import ApartmentList from '@/components/ApartmentList';
import { Apartment } from '@/types/apartment';
import Link from 'next/link';
import { ArrowLeft, Heart, Home } from 'lucide-react';

export default function FavoritesPage() {
    const { user, isLoading: authLoading } = useAuth();
    const { favoriteIds, refreshFavorites } = useFavorites();
    const [favorites, setFavorites] = useState<Apartment[]>([]);
    const [loading, setLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [showEmptyState, setShowEmptyState] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        console.log('🔄 FavoritesPage: проверка авторизации', { user, authLoading });

        if (!authLoading && !user) {
            window.location.href = '/';
            return;
        }

        if (user) {
            console.log('🔄 FavoritesPage: загрузка избранных для пользователя', user.id);
            fetchFavorites();
        }

        return () => {
            window.removeEventListener('resize', checkMobile);
        };
    }, [user, authLoading]);

    // Отдельный эффект для обновления при изменении favoriteIds
    useEffect(() => {
        if (user && favoriteIds.length > 0) {
            console.log('🔄 FavoritesPage: favoriteIds изменились', favoriteIds);
            fetchFavorites();
        }
    }, [favoriteIds, user]);

    const fetchFavorites = async () => {
        try {
            setLoading(true);
            console.log('🔄 FavoritesPage: выполнение fetchFavorites');
            const token = localStorage.getItem('auth_token');
            if (!token) {
                console.log('❌ FavoritesPage: нет токена');
                setShowEmptyState(true);
                return;
            }

            const response = await fetch('/api/favorites', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                console.log('✅ FavoritesPage: получены избранные', data);
                setFavorites(data);
                setShowEmptyState(data.length === 0);
            } else {
                console.error('❌ FavoritesPage: ошибка сервера', response.status);
                setShowEmptyState(true);
            }
        } catch (error) {
            console.error('❌ FavoritesPage: ошибка загрузки:', error);
            setShowEmptyState(true);
        } finally {
            setLoading(false);
        }
    };

    const handleFavoriteRemove = async (apartmentId: number) => {
        console.log('🗑️ FavoritesPage: удаление квартиры из избранных', apartmentId);

        // Немедленно обновляем UI
        setFavorites(prev => prev.filter(apt => apt.id !== apartmentId));

        // Обновляем список ID в хуке
        await refreshFavorites();

        // Показываем уведомление на мобильных
        if (isMobile) {
            alert('Удалено из избранного');
        }

        console.log('✅ FavoritesPage: квартира удалена из UI');
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50">
                <Header />
                <div className="pt-14 sm:pt-16">
                    <div className="container mx-auto px-4 py-8">
                        {/* Скелетон для заголовка */}
                        <div className="mb-8">
                            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2 animate-pulse"></div>
                            <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse"></div>
                        </div>

                        {/* Скелетоны для карточек */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="bg-white rounded-xl shadow-sm p-4 animate-pulse">
                                    <div className="h-48 bg-gray-200 rounded-lg mb-4"></div>
                                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/2 mb-2"></div>
                                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    console.log('🎨 FavoritesPage: рендер', { loading, favoritesCount: favorites.length });

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-gray-50">
            <Header />
            <div className="pt-14 sm:pt-16 pb-8">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8">
                    {/* Заголовок и навигация */}
                    <div className="mb-6 sm:mb-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-3 mb-2">
                                    <Link
                                        href="/results"
                                        className={`flex items-center gap-2 ${isMobile ? 'text-blue-600 p-2 rounded-lg bg-blue-50' : 'text-blue-600 hover:text-blue-700 transition-colors'}`}
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                        {!isMobile && <span>Назад к объявлениям</span>}
                                    </Link>
                                </div>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center">
                                        <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
                                    </div>
                                    <div>
                                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                                            Избранное
                                        </h1>
                                        <p className="text-gray-600 text-sm sm:text-base">
                                            Ваши сохранённые объявления
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Статистика */}
                            <div className={`${isMobile ? 'bg-white rounded-lg p-3 shadow-sm w-full' : ''}`}>
                                <div className="flex items-center gap-4">
                                    <div className={`${isMobile ? 'text-center flex-1' : 'text-right'}`}>
                                        <div className="text-2xl sm:text-3xl font-bold text-gray-900">
                                            {favorites.length}
                                        </div>
                                        <div className="text-sm text-gray-600">
                                            {favorites.length === 1 ? 'объявление' :
                                                favorites.length < 5 ? 'объявления' :
                                                    'объявлений'}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Кнопка "Найти ещё" для мобильных */}
                    {isMobile && favorites.length > 0 && (
                        <div className="mb-6">
                            <Link
                                href="/results"
                                className="flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg w-full font-medium"
                            >
                                <Home className="w-5 h-5" />
                                Найти ещё объявления
                            </Link>
                        </div>
                    )}

                    {/* Контент */}
                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
                            <p className="text-gray-600">Загрузка избранных...</p>
                        </div>
                    ) : showEmptyState ? (
                        <div className="max-w-md mx-auto text-center py-12 sm:py-16">
                            <div className="w-24 h-24 sm:w-32 sm:h-32 bg-gradient-to-r from-pink-100 to-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Heart className="w-12 h-12 sm:w-16 sm:h-16 text-pink-500" />
                            </div>
                            <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3">
                                Избранное пусто
                            </h3>
                            <p className="text-gray-600 mb-6 max-w-sm mx-auto">
                                Сохраняйте понравившиеся объявления, нажимая на сердечко ❤️
                            </p>
                            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                                <Link
                                    href="/results"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2"
                                >
                                    <Home className="w-5 h-5" />
                                    Найти жильё
                                </Link>
                                <Link
                                    href="/profile"
                                    className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-6 py-3 rounded-lg font-medium transition-colors inline-flex items-center justify-center gap-2"
                                >
                                    В профиль
                                </Link>
                            </div>
                        </div>
                    ) : (
                        <>
                            {/* Список избранного */}
                            <div className={`${isMobile ? 'space-y-4' : 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'}`}>
                                <ApartmentList
                                    apartments={favorites}
                                    onFavoriteRemove={handleFavoriteRemove}
                                    showFavoriteHeart={true}
                                />
                            </div>

                            {/* Кнопка "Найти ещё" внизу для десктопов */}
                            {!isMobile && (
                                <div className="mt-8 sm:mt-12 text-center">
                                    <div className="inline-flex flex-col sm:flex-row items-center gap-4 p-4 sm:p-6 bg-white rounded-xl shadow-sm border border-gray-200">
                                        <div className="text-left">
                                            <h4 className="font-semibold text-gray-900 mb-1">
                                                Нашли что искали?
                                            </h4>
                                            <p className="text-sm text-gray-600">
                                                Продолжайте искать идеальное жильё
                                            </p>
                                        </div>
                                        <Link
                                            href="/results"
                                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors whitespace-nowrap"
                                        >
                                            Найти ещё объявления
                                        </Link>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
