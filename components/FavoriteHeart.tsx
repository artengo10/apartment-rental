// components/FavoriteHeart.tsx - ИСПРАВЛЕННЫЙ
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useFavorites } from '@/hooks/useFavorites';
import { Heart } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FavoriteHeartProps {
    apartmentId: number;
    className?: string;
    size?: 'sm' | 'md' | 'lg';
    onToggle?: (isFavorite: boolean) => void;
}

export default function FavoriteHeart({
    apartmentId,
    className = "",
    size = "md",
    onToggle
}: FavoriteHeartProps) {
    const { user } = useAuth();
    const { isFavorite, toggleFavorite, loading } = useFavorites();
    const [isLoading, setIsLoading] = useState(false);
    const [currentIsFavorite, setCurrentIsFavorite] = useState(false);

    const sizeClasses = {
        sm: "w-4 h-4",
        md: "w-5 h-5",
        lg: "w-6 h-6"
    };

    useEffect(() => {
        const favoriteStatus = isFavorite(apartmentId);
        setCurrentIsFavorite(favoriteStatus);
    }, [apartmentId, isFavorite]);

    const handleToggleFavorite = async (e: React.MouseEvent) => {
        e.stopPropagation();
        e.preventDefault();

        if (!user) {
            alert('Пожалуйста, войдите в систему, чтобы добавлять в избранное');
            return;
        }

        if (isLoading) return;

        setIsLoading(true);

        try {
            const newFavoriteState = !currentIsFavorite;
            setCurrentIsFavorite(newFavoriteState);
            onToggle?.(newFavoriteState);

            const success = await toggleFavorite(apartmentId);

            if (!success) {
                setCurrentIsFavorite(!newFavoriteState);
                onToggle?.(!newFavoriteState);
            }
        } catch (error) {
            console.error('Error toggling favorite:', error);
            setCurrentIsFavorite(!currentIsFavorite);
            onToggle?.(!currentIsFavorite);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className={cn(
            "flex items-center justify-center", // ОБЯЗАТЕЛЬНО flex и центрирование
            "relative", // Для позиционирования внутри
            className
        )}>
            <button
                onClick={handleToggleFavorite}
                disabled={isLoading || loading}
                className={cn(
                    "flex items-center justify-center", // ГЛАВНОЕ ИСПРАВЛЕНИЕ!
                    "p-1.5 rounded-full transition-all duration-200 hover:scale-110",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    "w-9 h-9", // Фиксированная ширина и высота для центрирования
                    currentIsFavorite
                        ? "text-red-500 bg-red-50 hover:bg-red-100"
                        : "text-gray-400 bg-white/80 hover:bg-gray-100 hover:text-gray-600",
                )}
                title={currentIsFavorite ? "Удалить из избранного" : "Добавить в избранное"}
                style={{
                    minWidth: '36px', // Минимальная ширина для touch-устройств
                    minHeight: '36px' // Минимальная высота
                }}
            >
                <Heart
                    className={cn(
                        sizeClasses[size],
                        "transition-all duration-200",
                        currentIsFavorite && "fill-current"
                    )}
                />
            </button>
        </div>
    );
}
