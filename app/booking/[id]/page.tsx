'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import { Apartment } from '@/types/apartment'; // Оставляем импорт

export default function BookingPage() {
    const { user } = useAuth();
    const params = useParams();
    const router = useRouter();
    const [apartment, setApartment] = useState<Apartment | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchApartment();
    }, [params.id]);

    const fetchApartment = async () => {
        try {
            const response = await fetch(`/api/apartments/${params.id}`);
            if (response.ok) {
                const data = await response.json();
                setApartment(data);
            }
        } catch (error) {
            console.error('Error fetching apartment:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return <div>Loading...</div>;
    if (!apartment) return <div>Apartment not found</div>;

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />
            <div className="pt-12 container mx-auto px-4 py-6">
                <h1 className="text-2xl font-bold mb-4">Бронирование: {apartment.title}</h1>
                {/* Остальной код бронирования */}
            </div>
        </div>
    );
}