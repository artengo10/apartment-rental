'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

interface Apartment {
    id: number;
    title: string;
    description: string;
    price: number;
    type: string;
    district: string;
    address: string;
    rooms: number | null;
    area: number | null;
    floor: number | null;
    amenities: string[];
    images: string[];
    isPublished: boolean;
    createdAt: string;
}

export default function MyApartments() {
    const { user } = useAuth();
    const [apartments, setApartments] = useState<Apartment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (user) {
            fetchMyApartments();
        }
    }, [user]);

    const fetchMyApartments = async () => {
        try {
            const token = localStorage.getItem('auth_token');
            const response = await fetch('/api/apartments/my', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setApartments(data);
            } else {
                console.error('Ошибка при загрузке объявлений');
            }
        } catch (error) {
            console.error('Ошибка при загрузке объявлений:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4">
                    <div className="text-center">Загрузка...</div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold">Мои объявления</h1>
                    <Link
                        href="/results"
                        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
                    >
                        Назад к поиску
                    </Link>
                </div>

                {apartments.length === 0 ? (
                    <div className="text-center py-8">
                        <p className="text-gray-600 mb-4">У вас нет объявлений</p>
                        <Link
                            href="/"
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                        >
                            Добавить объявление
                        </Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {apartments.map(apartment => (
                            <div key={apartment.id} className="bg-white rounded-lg shadow-md overflow-hidden">
                                {apartment.images.length > 0 && (
                                    <img
                                        src={apartment.images[0]}
                                        alt={apartment.title}
                                        className="w-full h-48 object-cover"
                                    />
                                )}
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold mb-2">{apartment.title}</h3>
                                    <p className="text-gray-600 text-sm mb-2">{apartment.address}</p>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="text-green-600 font-bold">{apartment.price} ₽/сутки</span>
                                        <span className={`px-2 py-1 rounded text-xs ${apartment.isPublished ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {apartment.isPublished ? 'Опубликовано' : 'На модерации'}
                                        </span>
                                    </div>
                                    <p className="text-gray-500 text-sm">
                                        {new Date(apartment.createdAt).toLocaleDateString('ru-RU')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}