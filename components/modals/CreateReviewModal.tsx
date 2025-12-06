// components/modals/CreateReviewModal.tsx
'use client';

import { useState } from 'react';
import { X, Send } from 'lucide-react';
import StarRating from '@/components/StarRating';
import { useAuth } from '@/context/AuthContext';

interface CreateReviewModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    hostId: number;
    hostName: string;
    apartmentId?: number;
    chatId?: number;
}

export default function CreateReviewModal({
    isOpen,
    onClose,
    onSuccess,
    hostId,
    hostName,
    apartmentId,
    chatId
}: CreateReviewModalProps) {
    const { user } = useAuth();
    const [rating, setRating] = useState(0);
    const [comment, setComment] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (rating === 0) {
            setError('Пожалуйста, поставьте оценку');
            return;
        }

        if (comment.trim().length < 10) {
            setError('Комментарий должен содержать минимум 10 символов');
            return;
        }

        setLoading(true);
        setError('');

        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('/api/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    rating,
                    comment: comment.trim(),
                    hostId,
                    apartmentId,
                    chatId
                })
            });

            if (response.ok) {
                const result = await response.json();
                alert('Отзыв отправлен на модерацию! Спасибо за ваше мнение.');
                onSuccess();
                onClose();
                // Сброс формы
                setRating(0);
                setComment('');
            } else {
                const errorData = await response.json();
                setError(errorData.error || 'Ошибка при отправке отзыва');
            }
        } catch (error) {
            console.error('Error creating review:', error);
            setError('Произошла ошибка при отправке отзыва');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-[95vw] sm:max-w-md mx-auto max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-bold">Оставить отзыв</h2>
                    <button
                        onClick={onClose}
                        className="p-1 hover:bg-gray-100 rounded-full transition-colors"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <p className="text-gray-600 mb-4">
                    Оставьте отзыв для пользователя <strong>{hostName}</strong>
                </p>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Ваша оценка *
                        </label>
                        <StarRating
                            rating={rating}
                            onRatingChange={setRating}
                            size="lg"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-2">
                            Комментарий *
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Расскажите о вашем опыте взаимодействия с пользователем..."
                            className="w-full p-3 border border-gray-300 rounded-lg resize-none h-32 focus:outline-none focus:border-blue-500"
                            required
                            minLength={10}
                            maxLength={500}
                        />
                        <div className="text-xs text-gray-500 text-right mt-1">
                            {comment.length}/500 символов
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    )}

                    <div className="flex gap-3 pt-2">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={loading}
                            className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 transition-colors"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            disabled={loading || rating === 0 || comment.trim().length < 10}
                            className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                'Отправка...'
                            ) : (
                                <>
                                    <Send className="w-4 h-4" />
                                    Отправить
                                </>
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}