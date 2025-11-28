// components/ReviewList.tsx
'use client';

import { useState, useEffect } from 'react';
import StarRating from './StarRating';
import { Review } from '@/types/review';

interface ReviewListProps {
    hostId: number;
    className?: string;
}

export default function ReviewList({ hostId, className = "" }: ReviewListProps) {
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchReviews();
    }, [hostId]);

    const fetchReviews = async () => {
        try {
            const response = await fetch(`/api/reviews?hostId=${hostId}`);

            if (response.ok) {
                const data = await response.json();
                setReviews(data);
            } else {
                setError('Ошибка при загрузке отзывов');
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
            setError('Ошибка при загрузке отзывов');
        } finally {
            setLoading(false);
        }
    };

    const calculateAverageRating = () => {
        if (reviews.length === 0) return 0;
        const sum = reviews.reduce((acc, review) => acc + review.rating, 0);
        return Math.round((sum / reviews.length) * 10) / 10;
    };

    if (loading) {
        return (
            <div className={`animate-pulse ${className}`}>
                <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
                {[1, 2, 3].map(i => (
                    <div key={i} className="h-20 bg-gray-200 rounded mb-3"></div>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <div className={`text-center text-gray-500 py-8 ${className}`}>
                {error}
            </div>
        );
    }

    return (
        <div className={className}>
            {/* Заголовок с общим рейтингом */}
            <div className="flex items-center gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                <div className="text-center">
                    <div className="text-3xl font-bold text-gray-900">
                        {calculateAverageRating()}
                    </div>
                    <StarRating
                        rating={Math.round(calculateAverageRating())}
                        readonly
                        size="sm"
                    />
                    <div className="text-sm text-gray-600 mt-1">
                        {reviews.length} отзывов
                    </div>
                </div>
                <div className="flex-1">
                    <h3 className="font-semibold text-gray-900 mb-2">Распределение оценок</h3>
                    {[5, 4, 3, 2, 1].map(star => {
                        const count = reviews.filter(r => r.rating === star).length;
                        const percentage = reviews.length > 0 ? (count / reviews.length) * 100 : 0;

                        return (
                            <div key={star} className="flex items-center gap-2 text-sm mb-1">
                                <span className="w-4 text-gray-600">{star}</span>
                                <div className="flex-1 bg-gray-200 rounded-full h-2">
                                    <div
                                        className="bg-yellow-400 h-2 rounded-full"
                                        style={{ width: `${percentage}%` }}
                                    ></div>
                                </div>
                                <span className="w-8 text-gray-600 text-right">
                                    {count}
                                </span>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Список отзывов */}
            {reviews.length === 0 ? (
                <div className="text-center text-gray-500 py-8">
                    <div className="text-4xl mb-2">💬</div>
                    <p>Пока нет отзывов</p>
                    <p className="text-sm">Будьте первым, кто оставит отзыв!</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {reviews.map(review => (
                        <div key={review.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <div className="font-semibold text-gray-900">
                                        {review.author?.name || 'Аноним'}
                                    </div>
                                    {review.apartment && (
                                        <div className="text-sm text-gray-600">
                                            Объявление: {review.apartment.title}
                                        </div>
                                    )}
                                </div>
                                <div className="text-sm text-gray-500">
                                    {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                                </div>
                            </div>

                            <StarRating rating={review.rating} readonly size="sm" />

                            <p className="text-gray-700 mt-2 leading-relaxed">
                                {review.comment}
                            </p>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}