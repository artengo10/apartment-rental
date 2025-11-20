// components/SmartSearch.tsx - ПОЛНОСТЬЮ ПЕРЕРАБОТАННЫЙ
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

type PropertyType = 'apartment' | 'house' | 'studio' | 'all';

const SmartSearch = () => {
    const router = useRouter();
    const [selectedType, setSelectedType] = useState<PropertyType | null>(null);

    const handlePropertyTypeSelect = (type: PropertyType) => {
        setSelectedType(type);

        // Сохраняем выбранный тип и переходим на страницу результатов
        const searchCriteria = {
            propertyType: type,
            // Добавляем остальные параметры по умолчанию
            roomCount: 'any' as const,
            priceRange: { min: '', max: '' },
            district: 'all',
            amenities: [] as string[],
        };

        sessionStorage.setItem('searchCriteria', JSON.stringify(searchCriteria));
        router.push('/results');
    };

    const totalApartments = 100;

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-lg border-2 border-black p-4 sm:p-8 shadow-lg">
            {/* Уведомление с количеством квартир */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-center">
                <p className="text-blue-800 font-medium">
                    🏠 Доступно {totalApartments.toLocaleString()} вариантов жилья в Нижнем Новгороде
                </p>
            </div>

            {/* Шаг 1: Выбор типа жилья */}
            <div className="text-center">
                <h3 className="text-xl font-bold mb-6">Что вы ищете?</h3>
                <div className="grid grid-cols-2 gap-4">
                    <button
                        onClick={() => handlePropertyTypeSelect('apartment')}
                        className="p-4 sm:p-6 border-2 border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all flex flex-col items-center min-h-[120px] justify-center"
                    >
                        <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">🏢</div>
                        <span className="font-semibold text-sm sm:text-base">Квартира</span>
                        <span className="text-xs text-gray-600 mt-1 hidden sm:block">Отдельная квартира</span>
                    </button>

                    <button
                        onClick={() => handlePropertyTypeSelect('house')}
                        className="p-4 sm:p-6 border-2 border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all flex flex-col items-center min-h-[120px] justify-center"
                    >
                        <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">🏠</div>
                        <span className="font-semibold text-sm sm:text-base">Дом</span>
                        <span className="text-xs text-gray-600 mt-1 hidden sm:block">Частный дом</span>
                    </button>

                    <button
                        onClick={() => handlePropertyTypeSelect('studio')}
                        className="p-4 sm:p-6 border-2 border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all flex flex-col items-center min-h-[120px] justify-center"
                    >
                        <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">📐</div>
                        <span className="font-semibold text-sm sm:text-base">Студия</span>
                        <span className="text-xs text-gray-600 mt-1 hidden sm:block">Помещение-студия</span>
                    </button>

                    <button
                        onClick={() => handlePropertyTypeSelect('all')}
                        className="p-4 sm:p-6 border-2 border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center min-h-[120px] justify-center"
                    >
                        <div className="text-2xl sm:text-3xl mb-2 sm:mb-3">🔍</div>
                        <span className="font-semibold text-sm sm:text-base">Все варианты</span>
                        <span className="text-xs text-gray-600 mt-1 hidden sm:block">Показать все варианты</span>
                    </button>
                </div>
            </div>

            {/* Информация о выборе */}
            {selectedType && (
                <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg text-center">
                    <p className="text-green-700 font-medium">
                        Выбрано: {
                            selectedType === 'apartment' ? 'Квартира' :
                                selectedType === 'house' ? 'Дом' :
                                    selectedType === 'studio' ? 'Студия' : 'Все варианты'
                        }
                    </p>
                    <p className="text-sm text-green-600 mt-1">
                        Переходим к просмотру вариантов...
                    </p>
                </div>
            )}
        </div>
    );
};

export default SmartSearch;