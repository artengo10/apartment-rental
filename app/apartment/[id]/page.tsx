'use client';
import { useParams, useRouter } from 'next/navigation';
import { apartments } from '@/types/apartment';
import Link from 'next/link';
import { useState } from 'react';

export default function ApartmentPage() {
    const params = useParams();
    const router = useRouter();
    const [message, setMessage] = useState('');

    const apartmentId = parseInt(params.id as string);
    const apartment = apartments.find(apt => apt.id === apartmentId);

    if (!apartment) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <h1 className="text-2xl font-bold mb-4">Квартира не найдена</h1>
                    <Link href="/results" className="bg-blue-600 text-white px-6 py-3 rounded-lg">
                        Вернуться к поиску
                    </Link>
                </div>
            </div>
        );
    }

    const handleSendMessage = () => {
        setMessage('Сообщение отправлено! Мы свяжемся с вами в ближайшее время.');
        setTimeout(() => setMessage(''), 3000);
    };

    const handleCall = () => {
        alert(`Позвонить по номеру: +7 (999) 123-45-67\nКвартира: ${apartment.title}`);
    };

    const handleBook = () => {
        alert(`Бронирование квартиры: ${apartment.title}\nЦена: ${apartment.price}`);
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Хедер */}
            <header className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <Link href="/results" className="text-blue-600 hover:text-blue-800 flex items-center gap-2">
                            ← Назад к результатам
                        </Link>
                        <h1 className="text-xl font-bold">Детали квартиры</h1>
                    </div>
                </div>
            </header>

            <main className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    {/* Заголовок и цена */}
                    <div className="p-6 border-b">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">{apartment.title}</h1>
                                <p className="text-gray-600 mt-1">{apartment.address}</p>
                                <p className="text-sm text-gray-500 mt-2">{apartment.district}</p>
                            </div>
                            <div className="text-right">
                                <div className="text-3xl font-bold text-green-600">{apartment.price}</div>
                                <div className="text-sm text-gray-500">за сутки</div>
                            </div>
                        </div>
                    </div>

                    {/* Основной контент */}
                    <div className="p-6">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Левая колонка - описание */}
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Описание</h2>
                                <p className="text-gray-700 leading-relaxed">{apartment.description}</p>

                                <div className="mt-6">
                                    <h3 className="text-lg font-semibold mb-3">Удобства</h3>
                                    <div className="grid grid-cols-2 gap-2">
                                        {['Wi-Fi', 'Кухня', 'TV', 'Кондиционер', 'Стиральная машина', 'Парковка'].map((amenity) => (
                                            <div key={amenity} className="flex items-center gap-2">
                                                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                                                <span className="text-sm text-gray-600">{amenity}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* Правая колонка - карта и контакты */}
                            <div className="space-y-6">
                                {/* Мини-карта */}
                                <div className="bg-gray-200 rounded-lg h-48 flex items-center justify-center">
                                    <div className="text-center text-gray-600">
                                        <div className="text-2xl mb-2">🗺️</div>
                                        <p>Карта расположения</p>
                                        <p className="text-sm">{apartment.address}</p>
                                    </div>
                                </div>

                                {/* Блок контактов */}
                                <div className="bg-blue-50 rounded-lg p-4">
                                    <h3 className="font-semibold mb-3">Контакты</h3>
                                    <div className="space-y-3">
                                        <button
                                            onClick={handleCall}
                                            className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            📞 Позвонить
                                        </button>

                                        <button
                                            onClick={handleBook}
                                            className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition-colors flex items-center justify-center gap-2"
                                        >
                                            📅 Забронировать
                                        </button>
                                    </div>
                                </div>

                                {/* Чат */}
                                <div className="border rounded-lg p-4">
                                    <h3 className="font-semibold mb-3">Написать сообщение</h3>
                                    <textarea
                                        placeholder="Задайте вопрос о квартире..."
                                        className="w-full border rounded-lg p-3 mb-3 resize-none h-20"
                                    />
                                    <button
                                        onClick={handleSendMessage}
                                        className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                                    >
                                        Отправить сообщение
                                    </button>
                                    {message && (
                                        <div className="mt-3 p-2 bg-green-100 text-green-700 rounded text-sm">
                                            {message}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}