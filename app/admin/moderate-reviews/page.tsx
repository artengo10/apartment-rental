// app/admin/moderate-reviews/page.tsx
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import StarRating from '@/components/StarRating';
import { Review } from '@/types/review';

export default function ModerateReviewsPage() {
    const router = useRouter();
    const [reviews, setReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'>('PENDING');

    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (!token) {
            router.push('/admin/login');
            return;
        }
        fetchReviews(token);
    }, [filter, router]);

    const fetchReviews = async (token: string) => {
        try {
            const url = filter === 'ALL'
                ? '/api/admin/reviews'
                : `/api/admin/reviews?status=${filter}`;

            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setReviews(data);
            } else if (response.status === 401) {
                localStorage.removeItem('admin_token');
                router.push('/admin/login');
            } else {
                console.error('Failed to fetch reviews');
            }
        } catch (error) {
            console.error('Error fetching reviews:', error);
        } finally {
            setLoading(false);
        }
    };

    const updateReviewStatus = async (reviewId: number, status: string) => {
        const token = localStorage.getItem('admin_token');
        if (!token) {
            router.push('/admin/login');
            return;
        }

        try {
            const response = await fetch(`/api/admin/reviews/${reviewId}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                // Обновляем локальное состояние
                setReviews(prev => prev.filter(review => review.id !== reviewId));
                alert('Статус отзыва обновлен!');
            } else if (response.status === 401) {
                localStorage.removeItem('admin_token');
                router.push('/admin/login');
            } else {
                alert('Ошибка при обновлении статуса');
            }
        } catch (error) {
            console.error('Error updating review:', error);
            alert('Ошибка при обновлении статуса');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="pt-12 container mx-auto px-4 py-8">
                    <div className="text-center">Загрузка...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="pt-12 container mx-auto px-4 py-8">
                <h1 className="text-3xl font-bold mb-6">Модерация отзывов</h1>

                {/* Фильтры */}
                <div className="flex gap-2 mb-6">
                    {(['PENDING', 'APPROVED', 'REJECTED', 'ALL'] as const).map(status => (
                        <button
                            key={status}
                            onClick={() => setFilter(status)}
                            className={`px-4 py-2 rounded-lg transition-colors ${filter === status
                                ? 'bg-blue-600 text-white'
                                : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
                                }`}
                        >
                            {status === 'PENDING' && 'На модерации'}
                            {status === 'APPROVED' && 'Одобренные'}
                            {status === 'REJECTED' && 'Отклоненные'}
                            {status === 'ALL' && 'Все'}
                        </button>
                    ))}
                </div>

                {/* Список отзывов */}
                <div className="space-y-4">
                    {reviews.length === 0 ? (
                        <div className="text-center text-gray-500 py-8">
                            <div className="text-4xl mb-2">✅</div>
                            <p>Нет отзывов для модерации</p>
                        </div>
                    ) : (
                        reviews.map(review => (
                            <div key={review.id} className="bg-white rounded-lg border border-gray-200 p-4">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="font-semibold">
                                            От: {review.author?.name} → Кому: {review.host?.name}
                                        </div>
                                        {review.apartment && (
                                            <div className="text-sm text-gray-600">
                                                Объявление: {review.apartment.title}
                                            </div>
                                        )}
                                        <div className="text-sm text-gray-500">
                                            {new Date(review.createdAt).toLocaleDateString('ru-RU')}
                                        </div>
                                    </div>
                                    <div className={`px-2 py-1 rounded text-xs ${review.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                                        review.status === 'APPROVED' ? 'bg-green-100 text-green-800' :
                                            'bg-red-100 text-red-800'
                                        }`}>
                                        {review.status === 'PENDING' && 'На модерации'}
                                        {review.status === 'APPROVED' && 'Одобрен'}
                                        {review.status === 'REJECTED' && 'Отклонен'}
                                    </div>
                                </div>

                                <StarRating rating={review.rating} readonly size="sm" />

                                <p className="text-gray-700 mt-2 mb-3">{review.comment}</p>

                                {review.status === 'PENDING' && (
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => updateReviewStatus(review.id, 'APPROVED')}
                                            className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 transition-colors"
                                        >
                                            Одобрить
                                        </button>
                                        <button
                                            onClick={() => updateReviewStatus(review.id, 'REJECTED')}
                                            className="bg-red-600 text-white px-3 py-1 rounded text-sm hover:bg-red-700 transition-colors"
                                        >
                                            Отклонить
                                        </button>
                                    </div>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
