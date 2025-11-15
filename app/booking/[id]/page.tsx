// app/booking/[id]/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apartments, Apartment } from '@/types/apartment';
import Link from 'next/link';

export default function BookingPage() {
    const params = useParams();
    const router = useRouter();
    const [apartment, setApartment] = useState<Apartment | null>(null);
    const [nights, setNights] = useState(1);
    const [checkInDate, setCheckInDate] = useState('');
    const [checkOutDate, setCheckOutDate] = useState('');

    useEffect(() => {
        const apartmentId = parseInt(params.id as string);
        const foundApartment = apartments.find(apt => apt.id === apartmentId);
        setApartment(foundApartment || null);

        // Устанавливаем даты по умолчанию
        const today = new Date();
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        setCheckInDate(today.toISOString().split('T')[0]);
        setCheckOutDate(tomorrow.toISOString().split('T')[0]);
    }, [params.id]);

    const calculateTotalPrice = () => {
        if (!apartment) return 0;
        const price = parseInt(apartment.price.replace('₽', ''));
        return price * nights;
    };

    const handleBooking = () => {
        if (!checkInDate || !checkOutDate) {
            alert('Пожалуйста, выберите даты заезда и выезда');
            return;
        }

        alert(`Бронирование подтверждено!\n\nОбъявление: ${apartment?.title}\nДаты: ${checkInDate} - ${checkOutDate}\nИтого: ${calculateTotalPrice()}₽`);
        router.push('/results');
    };

    if (!apartment) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h2 className="text-2xl font-bold mb-4">Объявление не найдено</h2>
                    <Link href="/results" className="text-blue-600 hover:underline">
                        Вернуться к поиску
                    </Link>
                </div>
            </div>
        );
    }

    const pricePerNight = parseInt(apartment.price.replace('₽', ''));
    const totalPrice = calculateTotalPrice();

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Хедер */}
            <header className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <Link href="/" className="text-2xl font-bold text-green-600">
                            СъёмБронь
                        </Link>
                        <Link
                            href={`/apartment/${apartment.id}`}
                            className="text-gray-600 hover:text-gray-800"
                        >
                            ← Назад к объявлению
                        </Link>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <div className="max-w-2xl mx-auto">
                    <h1 className="text-3xl font-bold text-center mb-8">Бронирование жилья</h1>

                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                        <h2 className="text-xl font-bold mb-4">{apartment.title}</h2>
                        <p className="text-gray-600 mb-2">{apartment.address}</p>
                        <div className="flex items-center space-x-4 mb-4">
                            <span className="text-2xl font-bold text-green-600">
                                {apartment.price}
                            </span>
                            <span className="text-gray-500">/ сутки</span>
                        </div>
                    </div>

                    <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
                        <h3 className="text-lg font-semibold mb-4">Выберите даты</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Дата заезда
                                </label>
                                <input
                                    type="date"
                                    value={checkInDate}
                                    onChange={(e) => setCheckInDate(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Дата выезда
                                </label>
                                <input
                                    type="date"
                                    value={checkOutDate}
                                    onChange={(e) => setCheckOutDate(e.target.value)}
                                    className="w-full border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                                />
                            </div>
                        </div>

                        <div className="mb-6">
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Количество ночей: <span className="font-bold">{nights}</span>
                            </label>
                            <input
                                type="range"
                                min="1"
                                max="30"
                                value={nights}
                                onChange={(e) => setNights(parseInt(e.target.value))}
                                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                            />
                            <div className="flex justify-between text-sm text-gray-500 mt-1">
                                <span>1 ночь</span>
                                <span>30 ночей</span>
                            </div>
                        </div>

                        <div className="border-t pt-4">
                            <div className="space-y-2">
                                <div className="flex justify-between">
                                    <span>{apartment.price} × {nights} ночей</span>
                                    <span>{pricePerNight * nights}₽</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Сбор за уборку</span>
                                    <span>500₽</span>
                                </div>
                                <div className="flex justify-between">
                                    <span>Сервисный сбор</span>
                                    <span>300₽</span>
                                </div>
                                <div className="border-t pt-2 flex justify-between font-bold text-lg">
                                    <span>Итого</span>
                                    <span className="text-green-600">{totalPrice + 800}₽</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <button
                        onClick={handleBooking}
                        className="w-full bg-green-600 hover:bg-green-700 text-white py-4 px-6 rounded-lg font-semibold text-lg transition-colors"
                    >
                        Подтвердить бронирование
                    </button>
                </div>
            </div>
        </div>
    );
}