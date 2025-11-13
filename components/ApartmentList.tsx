import { Apartment } from '../types/apartment';
import { useState } from 'react';

interface ApartmentListProps {
    apartments: Apartment[];
}

const ApartmentList = ({ apartments }: ApartmentListProps) => {
    const [showAll, setShowAll] = useState(false);
    const initialCount = 4; // Показываем сначала 4 квартиры

    const displayedApartments = showAll ? apartments : apartments.slice(0, initialCount);
    const remainingCount = apartments.length - initialCount;

    return (
        <div className="mt-8 border-2 border-black rounded-lg p-4 bg-white">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Доступные квартиры</h3>
                {!showAll && remainingCount > 0 && (
                    <button
                        onClick={() => setShowAll(true)}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors text-sm"
                    >
                        Показать еще {remainingCount}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {displayedApartments.map(apartment => (
                    <div key={apartment.id} className="p-3 border border-gray-300 rounded-lg bg-white shadow-sm flex flex-col hover:shadow-md transition-shadow">
                        <div className="flex-1 mb-3">
                            <h4 className="font-semibold text-blue-700 text-sm mb-2 leading-tight">{apartment.title}</h4>
                            <p className="text-xs text-gray-600 mb-2">{apartment.address}</p>
                            <p className="text-xs text-gray-500 mb-3 line-clamp-2">{apartment.description}</p>
                            <div className="flex items-center justify-between">
                                <span className="font-bold text-green-600 text-sm">{apartment.price}</span>
                            </div>
                        </div>
                        <div className="flex gap-2 mt-auto">
                            <button
                                className="flex-1 bg-blue-600 text-white py-2 rounded text-xs font-medium hover:bg-blue-700 transition-colors whitespace-nowrap"
                                onClick={() => alert(`Просмотр: ${apartment.title}\nАдрес: ${apartment.address}\nЦена: ${apartment.price}`)}
                            >
                                Просмотреть
                            </button>
                            <button
                                className="flex-1 bg-green-600 text-white py-2 rounded text-xs font-medium hover:bg-green-700 transition-colors whitespace-nowrap"
                                onClick={() => alert(`Бронируем: ${apartment.title}`)}
                            >
                                Забронировать
                            </button>
                        </div>
                    </div>
                ))}
            </div>

            {/* Кнопка "Скрыть" когда показаны все */}
            {showAll && (
                <div className="mt-6 text-center">
                    <button
                        onClick={() => setShowAll(false)}
                        className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded transition-colors text-sm"
                    >
                        Скрыть
                    </button>
                </div>
            )}
        </div>
    );
};

export default ApartmentList;