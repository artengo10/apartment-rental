'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

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
}

export default function AdminModerate() {
    const [apartments, setApartments] = useState<Apartment[]>([]);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

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

    if (loading) {
        return <div className="p-8">Загрузка...</div>;
    }

    return (
        <div className="p-8">
            <h1 className="text-2xl font-bold mb-6">Модерация объявлений</h1>

            {apartments.length === 0 ? (
                <p>Нет объявлений для модерации</p>
            ) : (
                <div className="space-y-6">
                    {apartments.map(apartment => (
                        <div key={apartment.id} className="border rounded-lg p-6">
                            <div className="flex gap-6">
                                {/* Фотографии */}
                                <div className="flex-shrink-0">
                                    {apartment.images.length > 0 ? (
                                        <img
                                            src={apartment.images[0]}
                                            alt={apartment.title}
                                            className="w-48 h-32 object-cover rounded"
                                        />
                                    ) : (
                                        <div className="w-48 h-32 bg-gray-200 rounded flex items-center justify-center">
                                            <span>Нет фото</span>
                                        </div>
                                    )}
                                </div>

                                {/* Информация */}
                                <div className="flex-grow">
                                    <h3 className="text-xl font-semibold mb-2">{apartment.title}</h3>
                                    <p className="text-gray-600 mb-2">{apartment.description}</p>

                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        <div>
                                            <strong>Цена:</strong> {apartment.price} ₽/сутки
                                        </div>
                                        <div>
                                            <strong>Тип:</strong> {apartment.type}
                                        </div>
                                        <div>
                                            <strong>Район:</strong> {apartment.district}
                                        </div>
                                        <div>
                                            <strong>Адрес:</strong> {apartment.address}
                                        </div>
                                        {apartment.rooms && (
                                            <div>
                                                <strong>Комнат:</strong> {apartment.rooms}
                                            </div>
                                        )}
                                        {apartment.area && (
                                            <div>
                                                <strong>Площадь:</strong> {apartment.area} м²
                                            </div>
                                        )}
                                    </div>

                                    <div className="mb-4">
                                        <strong>Хозяин:</strong> {apartment.host.name} ({apartment.host.email}, {apartment.host.phone})
                                    </div>

                                    {apartment.amenities.length > 0 && (
                                        <div className="mb-4">
                                            <strong>Удобства:</strong> {apartment.amenities.join(', ')}
                                        </div>
                                    )}

                                    <div className="flex gap-4">
                                        <button
                                            onClick={() => handleModeration(apartment.id, 'approve')}
                                            className="bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
                                        >
                                            Одобрить и опубликовать
                                        </button>
                                        <button
                                            onClick={() => handleModeration(apartment.id, 'reject')}
                                            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                                        >
                                            Отклонить
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
