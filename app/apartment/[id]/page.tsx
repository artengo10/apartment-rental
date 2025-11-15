// app/apartment/[id]/page.tsx
'use client';
import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { apartments, Apartment } from '@/types/apartment';
import Image from 'next/image';
import Link from 'next/link';

export default function ApartmentDetail() {
    const params = useParams();
    const router = useRouter();
    const [apartment, setApartment] = useState<Apartment | null>(null);
    const [currentPhotoIndex, setCurrentPhotoIndex] = useState(0);
    const [showChat, setShowChat] = useState(false);
    const [message, setMessage] = useState('');

    useEffect(() => {
        const apartmentId = parseInt(params.id as string);
        const foundApartment = apartments.find(apt => apt.id === apartmentId);
        setApartment(foundApartment || null);
    }, [params.id]);

    const nextPhoto = () => {
        if (apartment?.photos) {
            setCurrentPhotoIndex((prev) =>
                prev === apartment.photos!.length - 1 ? 0 : prev + 1
            );
        }
    };

    const prevPhoto = () => {
        if (apartment?.photos) {
            setCurrentPhotoIndex((prev) =>
                prev === 0 ? apartment.photos!.length - 1 : prev - 1
            );
        }
    };

    const handleCall = () => {
        alert(`Позвонить по номеру: +7 (999) 123-45-67\nОбъявление: ${apartment?.title}`);
    };

    const handleSendMessage = (e: React.FormEvent) => {
        e.preventDefault();
        if (message.trim()) {
            alert(`Сообщение отправлено хозяину: "${message}"`);
            setMessage('');
            setShowChat(false);
        }
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

    const hasDiscount = apartment.originalPrice && apartment.originalPrice !== apartment.price;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Хедер */}
            <header className="bg-white shadow-sm border-b">
                <div className="container mx-auto px-4 py-4">
                    <div className="flex justify-between items-center">
                        <Link href="/" className="text-2xl font-bold text-green-600">
                            СъёмБронь
                        </Link>
                        <button
                            onClick={() => router.push('/results')}
                            className="bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg font-medium transition-colors"
                        >
                            ← Назад к поиску
                        </button>
                    </div>
                </div>
            </header>

            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Левая колонка - фотографии */}
                    <div className="space-y-4">
                        {/* Основное фото */}
                        <div className="relative bg-white rounded-xl shadow-lg overflow-hidden">
                            {apartment.photos && apartment.photos.length > 0 ? (
                                <>
                                    <div className="relative h-96 lg:h-[500px]">
                                        <Image
                                            src={apartment.photos[currentPhotoIndex]}
                                            alt={apartment.title}
                                            fill
                                            className="object-cover"
                                        />
                                    </div>

                                    {/* Навигация фото */}
                                    {apartment.photos.length > 1 && (
                                        <>
                                            <button
                                                onClick={prevPhoto}
                                                className="absolute left-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                                            >
                                                ←
                                            </button>
                                            <button
                                                onClick={nextPhoto}
                                                className="absolute right-4 top-1/2 transform -translate-y-1/2 bg-white/80 hover:bg-white p-2 rounded-full shadow-lg transition-all"
                                            >
                                                →
                                            </button>

                                            {/* Индикаторы */}
                                            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                                                {apartment.photos.map((_, index) => (
                                                    <button
                                                        key={index}
                                                        onClick={() => setCurrentPhotoIndex(index)}
                                                        className={`w-3 h-3 rounded-full transition-all ${index === currentPhotoIndex
                                                                ? 'bg-white'
                                                                : 'bg-white/50'
                                                            }`}
                                                    />
                                                ))}
                                            </div>
                                        </>
                                    )}
                                </>
                            ) : (
                                <div className="h-96 lg:h-[500px] bg-gray-200 flex items-center justify-center">
                                    <span className="text-gray-500">Нет фотографий</span>
                                </div>
                            )}
                        </div>

                        {/* Миниатюры */}
                        {apartment.photos && apartment.photos.length > 1 && (
                            <div className="grid grid-cols-4 gap-2">
                                {apartment.photos.map((photo, index) => (
                                    <button
                                        key={index}
                                        onClick={() => setCurrentPhotoIndex(index)}
                                        className={`relative h-20 rounded-lg overflow-hidden border-2 transition-all ${index === currentPhotoIndex
                                                ? 'border-green-500'
                                                : 'border-transparent'
                                            }`}
                                    >
                                        <Image
                                            src={photo}
                                            alt={`${apartment.title} ${index + 1}`}
                                            fill
                                            className="object-cover"
                                        />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Правая колонка - информация */}
                    <div className="space-y-6">
                        {/* Заголовок и цена */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h1 className="text-2xl font-bold text-gray-900 mb-2">
                                {apartment.title}
                            </h1>
                            <p className="text-gray-600 mb-4">{apartment.address}</p>

                            <div className="flex items-center space-x-4 mb-4">
                                <span className="text-3xl font-bold text-green-600">
                                    {apartment.price}
                                </span>
                                {hasDiscount && (
                                    <>
                                        <span className="text-xl text-gray-500 line-through">
                                            {apartment.originalPrice}
                                        </span>
                                        <span className="bg-red-100 text-red-600 px-2 py-1 rounded text-sm font-medium">
                                            Скидка
                                        </span>
                                    </>
                                )}
                                <span className="text-gray-500">/ сутки</span>
                            </div>

                            {/* Кнопки действий */}
                            <div className="grid grid-cols-2 gap-3 mb-4">
                                <button
                                    onClick={handleCall}
                                    className="bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                                >
                                    <span>📞</span>
                                    <span>Позвонить</span>
                                </button>

                                <Link
                                    href={`/booking/${apartment.id}`}
                                    className="bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                                >
                                    <span>🏨</span>
                                    <span>Забронировать</span>
                                </Link>

                                <button
                                    onClick={() => setShowChat(true)}
                                    className="bg-purple-600 hover:bg-purple-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                                >
                                    <span>💬</span>
                                    <span>Чат</span>
                                </button>

                                <button
                                    onClick={() => router.push('/results')}
                                    className="bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg font-semibold transition-colors flex items-center justify-center space-x-2"
                                >
                                    <span>🔍</span>
                                    <span>Искать другие</span>
                                </button>
                            </div>
                        </div>

                        {/* Описание */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold mb-4">Описание</h2>
                            <p className="text-gray-700 leading-relaxed">
                                {apartment.description} Уютное и комфортабельное жилье со всеми удобствами.
                                Идеально подходит для краткосрочного проживания. Рядом есть магазины,
                                кафе и общественный транспорт.
                            </p>
                        </div>

                        {/* Характеристики */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold mb-4">Характеристики</h2>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Тип:</span>
                                    <span className="font-medium">
                                        {apartment.type === 'apartment' ? 'Квартира' :
                                            apartment.type === 'house' ? 'Дом' : 'Студия'}
                                    </span>
                                </div>
                                {apartment.rooms && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Комнат:</span>
                                        <span className="font-medium">{apartment.rooms}</span>
                                    </div>
                                )}
                                {apartment.area && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Площадь:</span>
                                        <span className="font-medium">{apartment.area} м²</span>
                                    </div>
                                )}
                                {apartment.floor && (
                                    <div className="flex justify-between">
                                        <span className="text-gray-600">Этаж:</span>
                                        <span className="font-medium">{apartment.floor}</span>
                                    </div>
                                )}
                                <div className="flex justify-between">
                                    <span className="text-gray-600">Район:</span>
                                    <span className="font-medium">{apartment.district}</span>
                                </div>
                            </div>
                        </div>

                        {/* Удобства */}
                        {apartment.amenities && (
                            <div className="bg-white rounded-xl shadow-lg p-6">
                                <h2 className="text-xl font-bold mb-4">Удобства</h2>
                                <div className="grid grid-cols-2 gap-2">
                                    {apartment.amenities.map((amenity, index) => (
                                        <div key={index} className="flex items-center space-x-2">
                                            <span className="text-green-500">✓</span>
                                            <span>{amenity}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Хозяин */}
                        <div className="bg-white rounded-xl shadow-lg p-6">
                            <h2 className="text-xl font-bold mb-4">Хозяин</h2>
                            <div className="flex items-center space-x-4">
                                <div className="w-12 h-12 bg-gray-300 rounded-full flex items-center justify-center">
                                    <span className="text-lg">👤</span>
                                </div>
                                <div>
                                    <div className="font-semibold">
                                        {apartment.hostName || 'Анна'}
                                    </div>
                                    <div className="flex items-center space-x-1 text-sm text-gray-600">
                                        <span>⭐ {apartment.hostRating || '4.8'}</span>
                                        <span>•</span>
                                        <span>В сети 2 часа назад</span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Чат (модальное окно) */}
            {showChat && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-2xl w-full max-w-md">
                        <div className="p-4 border-b flex justify-between items-center">
                            <h3 className="text-lg font-semibold">Чат с хозяином</h3>
                            <button
                                onClick={() => setShowChat(false)}
                                className="text-gray-500 hover:text-gray-700"
                            >
                                ✕
                            </button>
                        </div>

                        <div className="p-4 h-64 overflow-y-auto space-y-4">
                            <div className="flex justify-start">
                                <div className="bg-gray-100 rounded-lg p-3 max-w-xs">
                                    <p>Здравствуйте! Чем могу помочь?</p>
                                    <span className="text-xs text-gray-500 block mt-1">10:30</span>
                                </div>
                            </div>
                        </div>

                        <form onSubmit={handleSendMessage} className="p-4 border-t">
                            <div className="flex space-x-2">
                                <input
                                    type="text"
                                    value={message}
                                    onChange={(e) => setMessage(e.target.value)}
                                    placeholder="Напишите сообщение..."
                                    className="flex-1 border border-gray-300 rounded-lg px-4 py-2 focus:outline-none focus:border-blue-500"
                                />
                                <button
                                    type="submit"
                                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors"
                                >
                                    Отправить
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}