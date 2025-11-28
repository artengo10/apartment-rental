// app/favorites/page.tsx - УЛУЧШЕННАЯ ВЕРСИЯ
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';
import Header from '@/components/Header';
import ApartmentList from '@/components/ApartmentList';
import { Apartment } from '@/types/apartment';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function FavoritesPage() {
    const { user, isLoading: authLoading } = useAuth();
    const { favoriteIds, refreshFavorites } = useFavorites();
    const [favorites, setFavorites] = useState<Apartment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        console.log('🔄 FavoritesPage: проверка авторизации', { user, authLoading });

        if (!authLoading && !user) {
            window.location.href = '/';
            return;
        }

        if (user) {
            console.log('🔄 FavoritesPage: загрузка избранных для пользователя', user.id);
            fetchFavorites();
        }
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
            console.log('🔄 FavoritesPage: выполнение fetchFavorites');
            const token = localStorage.getItem('auth_token');
            if (!token) {
                console.log('❌ FavoritesPage: нет токена');
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
            } else {
                console.error('❌ FavoritesPage: ошибка сервера', response.status);
            }
        } catch (error) {
            console.error('❌ FavoritesPage: ошибка загрузки:', error);
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

        console.log('✅ FavoritesPage: квартира удалена из UI');
    };

    if (authLoading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="pt-12 flex items-center justify-center min-h-[80vh]">
                    <div className="text-lg">Загрузка...</div>
                </div>
            </div>
        );
    }

    if (!user) {
        return null;
    }

    console.log('🎨 FavoritesPage: рендер', { loading, favoritesCount: favorites.length });

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="pt-12 container mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/results"
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5" />
                            Назад к объявлениям
                        </Link>
                        <h1 className="text-3xl font-bold">Избранное</h1>
                    </div>
                    <div className="text-sm text-gray-600">
                        {favorites.length} объявлений
                    </div>
                </div>

                {loading ? (
                    <div className="text-center py-8">Загрузка избранных...</div>
                ) : favorites.length === 0 ? (
                    <div className="text-center text-gray-500 py-12">
                        <div className="text-6xl mb-4">❤️</div>
                        <p className="text-lg mb-2">У вас пока нет избранных объявлений</p>
                        <p className="text-sm mb-6">Добавляйте объявления в избранное, нажимая на сердечко</p>
                        <Link
                            href="/results"
                            className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            Найти жилье
                        </Link>
                    </div>
                ) : (
                    <ApartmentList
                        apartments={favorites}
                        onFavoriteRemove={handleFavoriteRemove}
                        showFavoriteHeart={true}
                    />
                )}
            </div>
        </div>
    );
}
