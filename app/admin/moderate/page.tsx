'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight, Edit } from 'lucide-react';

interface Apartment {
    id: number;
    title: string;
    description: string;
    price: number;
    type: string;
    district: string;
    address: string;
    images: string[];
    rooms?: number;
    area?: number;
    floor?: number;
    amenities: string[];
    host: {
        name: string;
        email: string;
        phone: string;
    };
    createdAt: string;
    status: string;
    isEdited: boolean;
}

export default function AdminModerate() {
    const [apartments, setApartments] = useState<Apartment[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Состояние для хранения текущего индекса изображения для каждого объявления
    const [currentImageIndexes, setCurrentImageIndexes] = useState<Record<number, number>>({});

    useEffect(() => {
        const token = localStorage.getItem('admin_token');
        if (!token) {
            router.push('/admin/login');
            return;
        }
        fetchPendingApartments(token);
    }, [router]);

    const fetchPendingApartments = async (token: string) => {
        try {
            const response = await fetch('/api/admin/apartments?status=PENDING', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setApartments(data);

                // Инициализируем индексы изображений для каждого объявления
                const initialIndexes: Record<number, number> = {};
                data.forEach((apt: Apartment) => {
                    initialIndexes[apt.id] = 0;
                });
                setCurrentImageIndexes(initialIndexes);
            } else if (response.status === 401) {
                localStorage.removeItem('admin_token');
                router.push('/admin/login');
            }
        } catch (error) {
            console.error('Error fetching apartments:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleModeration = async (apartmentId: number, action: 'approve' | 'reject') => {
        const token = localStorage.getItem('admin_token');
        if (!token) {
            router.push('/admin/login');
            return;
        }

        try {
            const response = await fetch('/api/admin/apartments', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    apartmentId,
                    action
                }),
            });

            if (response.ok) {
                // Убираем обработанное объявление из списка
                setApartments(prev => prev.filter(apt => apt.id !== apartmentId));
                alert(action === 'approve' ? 'Объявление одобрено и опубликовано!' : 'Объявление отклонено');
            } else if (response.status === 401) {
                localStorage.removeItem('admin_token');
                router.push('/admin/login');
            } else {
                const errorData = await response.json();
                alert(`Ошибка: ${errorData.error}`);
            }
        } catch (error) {
            console.error('Error moderating apartment:', error);
            alert('Ошибка при модерации');
        }
    };

    // Функции для управления каруселью
    const nextImage = (apartmentId: number, totalImages: number) => {
        setCurrentImageIndexes(prev => ({
            ...prev,
            [apartmentId]: (prev[apartmentId] + 1) % totalImages
        }));
    };

    const prevImage = (apartmentId: number, totalImages: number) => {
        setCurrentImageIndexes(prev => ({
            ...prev,
            [apartmentId]: (prev[apartmentId] - 1 + totalImages) % totalImages
        }));
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-4">Загрузка...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 p-8">
            {/* Заголовок и навигация */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-gray-900 mb-4">Админ панель</h1>
                <div className="flex gap-4 mb-6">
                    <button
                        onClick={() => router.push('/admin/moderate')}
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                    >
                        Модерация жилья
                    </button>
                    <button
                        onClick={() => router.push('/admin/moderate-reviews')}
                        className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 transition-colors"
                    >
                        Модерация отзывов
                    </button>
                </div>
            </div>

            <h1 className="text-2xl font-bold mb-6">Модерация объявлений</h1>

            {apartments.length === 0 ? (
                <div className="text-center py-12 bg-white rounded-lg shadow-sm">
                    <div className="text-4xl mb-4">✅</div>
                    <h3 className="text-lg font-semibold mb-2">Нет объявлений для модерации</h3>
                    <p className="text-gray-600">Все объявления проверены и обработаны</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {apartments.map((apartment) => {
                        const currentIndex = currentImageIndexes[apartment.id] || 0;
                        const totalImages = apartment.images.length;

                        return (
                            <div key={apartment.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                <div className="p-6">
                                    <div className="flex flex-col lg:flex-row gap-6">
                                        {/* Фотографии с каруселью */}
                                        <div className="lg:w-1/3">
                                            <div className="relative">
                                                {totalImages > 0 ? (
                                                    <>
                                                        <div className="relative h-64 rounded-lg overflow-hidden bg-gray-100">
                                                            <img
                                                                src={apartment.images[currentIndex]}
                                                                alt={`${apartment.title} - фото ${currentIndex + 1}`}
                                                                className="w-full h-full object-cover"
                                                            />

                                                            {/* Навигация по фотографиям */}
                                                            {totalImages > 1 && (
                                                                <>
                                                                    <button
                                                                        onClick={() => prevImage(apartment.id, totalImages)}
                                                                        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                                                                    >
                                                                        <ChevronLeft className="w-5 h-5" />
                                                                    </button>
                                                                    <button
                                                                        onClick={() => nextImage(apartment.id, totalImages)}
                                                                        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-black/50 text-white p-2 rounded-full hover:bg-black/70 transition-colors"
                                                                    >
                                                                        <ChevronRight className="w-5 h-5" />
                                                                    </button>
                                                                </>
                                                            )}

                                                            {/* Индикаторы фотографий */}
                                                            {totalImages > 1 && (
                                                                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
                                                                    {apartment.images.map((_, index) => (
                                                                        <button
                                                                            key={index}
                                                                            onClick={() => setCurrentImageIndexes(prev => ({
                                                                                ...prev,
                                                                                [apartment.id]: index
                                                                            }))}
                                                                            className={`w-2 h-2 rounded-full ${index === currentIndex ? 'bg-white' : 'bg-white/50'}`}
                                                                        />
                                                                    ))}
                                                                </div>
                                                            )}
                                                        </div>

                                                        {/* Счетчик фотографий */}
                                                        <div className="text-sm text-gray-500 mt-2 text-center">
                                                            Фото {currentIndex + 1} из {totalImages}
                                                        </div>

                                                        {/* Миниатюры */}
                                                        {totalImages > 1 && (
                                                            <div className="grid grid-cols-4 gap-2 mt-2">
                                                                {apartment.images.slice(0, 4).map((image, index) => (
                                                                    <button
                                                                        key={index}
                                                                        onClick={() => setCurrentImageIndexes(prev => ({
                                                                            ...prev,
                                                                            [apartment.id]: index
                                                                        }))}
                                                                        className={`rounded overflow-hidden border-2 ${index === currentIndex ? 'border-blue-500' : 'border-transparent'}`}
                                                                    >
                                                                        <img
                                                                            src={image}
                                                                            alt={`Миниатюра ${index + 1}`}
                                                                            className="w-full h-16 object-cover"
                                                                        />
                                                                    </button>
                                                                ))}
                                                                {totalImages > 4 && (
                                                                    <div className="bg-gray-100 rounded flex items-center justify-center text-sm text-gray-500">
                                                                        +{totalImages - 4}
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </>
                                                ) : (
                                                    <div className="h-64 bg-gray-200 rounded-lg flex flex-col items-center justify-center">
                                                        <div className="text-4xl mb-2">🏠</div>
                                                        <span className="text-gray-500">Нет фотографий</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Информация об объявлении */}
                                        <div className="lg:w-2/3">
                                            <div className="flex items-start justify-between mb-4">
                                                <div>
                                                    <h3 className="text-xl font-semibold text-gray-900">
                                                        {apartment.title}
                                                        {apartment.isEdited && (
                                                            <span className="ml-3 inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-purple-100 text-purple-800">
                                                                <Edit className="w-4 h-4 mr-1" />
                                                                Изменено
                                                            </span>
                                                        )}
                                                    </h3>
                                                    <p className="text-gray-600 mt-1">{apartment.address}</p>
                                                </div>
                                                <div className="text-right">
                                                    <div className="text-2xl font-bold text-green-600">
                                                        {apartment.price} ₽/сутки
                                                    </div>
                                                    <div className="text-sm text-gray-500">за сутки</div>
                                                </div>
                                            </div>

                                            <p className="text-gray-700 mb-4">{apartment.description}</p>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                                <div>
                                                    <div className="text-sm text-gray-500">Тип</div>
                                                    <div className="font-medium">{apartment.type}</div>
                                                </div>
                                                {apartment.rooms && (
                                                    <div>
                                                        <div className="text-sm text-gray-500">Комнат</div>
                                                        <div className="font-medium">{apartment.rooms}</div>
                                                    </div>
                                                )}
                                                {apartment.area && (
                                                    <div>
                                                        <div className="text-sm text-gray-500">Площадь</div>
                                                        <div className="font-medium">{apartment.area} м²</div>
                                                    </div>
                                                )}
                                                <div>
                                                    <div className="text-sm text-gray-500">Район</div>
                                                    <div className="font-medium">{apartment.district}</div>
                                                </div>
                                            </div>

                                            {/* Удобства */}
                                            {apartment.amenities.length > 0 && (
                                                <div className="mb-4">
                                                    <div className="text-sm text-gray-500 mb-2">Удобства</div>
                                                    <div className="flex flex-wrap gap-2">
                                                        {apartment.amenities.map((amenity, index) => (
                                                            <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 text-sm rounded-full">
                                                                {amenity}
                                                            </span>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Информация о хозяине */}
                                            <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                                                <div className="text-sm text-gray-500 mb-2">Хозяин</div>
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <div className="font-medium">{apartment.host.name}</div>
                                                        <div className="text-sm text-gray-600">{apartment.host.email}</div>
                                                        <div className="text-sm text-gray-600">{apartment.host.phone}</div>
                                                    </div>
                                                    <div className="text-right">
                                                        <div className="text-sm text-gray-500">Создано</div>
                                                        <div className="text-sm">{new Date(apartment.createdAt).toLocaleDateString('ru-RU')}</div>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Кнопки модерации */}
                                            <div className="flex gap-3">
                                                <button
                                                    onClick={() => handleModeration(apartment.id, 'approve')}
                                                    className="flex-1 bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                                                >
                                                    ✅ Одобрить и опубликовать
                                                </button>
                                                <button
                                                    onClick={() => handleModeration(apartment.id, 'reject')}
                                                    className="flex-1 bg-red-600 text-white py-3 px-4 rounded-lg hover:bg-red-700 transition-colors font-medium"
                                                >
                                                    ❌ Отклонить
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}
