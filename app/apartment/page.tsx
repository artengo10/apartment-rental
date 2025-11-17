// app/apartment/[id]/page.tsx
'use client';
import { useParams } from 'next/navigation';
import { apartments } from '@/types/apartment';
import { MapPin, Home, Ruler, Phone } from 'lucide-react';

export default function ApartmentPage() {
    const params = useParams();
    const apartment = apartments.find(apt => apt.id === parseInt(params.id as string));

    if (!apartment) {
        return <div>Объект не найден</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="container mx-auto px-4 py-8">
                <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="h-64 bg-gray-200 flex items-center justify-center">
                        <Home className="h-16 w-16 text-gray-400" />
                        {/* Здесь будут фото */}
                    </div>

                    <div className="p-6">
                        <h1 className="text-3xl font-bold mb-2">{apartment.title}</h1>
                        <div className="flex items-center text-gray-600 mb-4">
                            <MapPin className="h-5 w-5 mr-2" />
                            <span>{apartment.address}</span>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h2 className="text-xl font-semibold mb-4">Описание</h2>
                                <p className="text-gray-700">{apartment.description}</p>

                                <div className="mt-6 grid grid-cols-2 gap-4">
                                    <div className="flex items-center">
                                        <Ruler className="h-5 w-5 mr-2 text-blue-500" />
                                        <span>Площадь: {apartment.area} м²</span>
                                    </div>
                                    {apartment.rooms && (
                                        <div className="flex items-center">
                                            <Home className="h-5 w-5 mr-2 text-green-500" />
                                            <span>Комнат: {apartment.rooms}</span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="bg-gray-50 p-6 rounded-lg">
                                <div className="text-3xl font-bold text-green-600 mb-4">
                                    {apartment.price}
                                    <span className="text-sm text-gray-500"> / сутки</span>
                                </div>

                                <button className="w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors flex items-center justify-center">
                                    <Phone className="h-5 w-5 mr-2" />
                                    Позвонить для бронирования
                                </button>

                                <div className="mt-4 text-sm text-gray-600">
                                    <p>📍 Район: {apartment.district}</p>
                                    <p>🏠 Тип: {apartment.type === 'apartment' ? 'Квартира' : apartment.type === 'house' ? 'Дом' : 'Студия'}</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}