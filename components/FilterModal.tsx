// components/FilterModal.tsx
'use client';

import { useState, useEffect } from 'react';
import { SearchCriteria } from '@/types/scoring';
import { getAmenitiesByType, type PropertyType } from '@/lib/amenities-config';

interface FilterModalProps {
    searchCriteria: SearchCriteria | null;
    onApply: (criteria: SearchCriteria) => void;
    onClose: () => void;
}

const FilterModal = ({ searchCriteria, onApply, onClose }: FilterModalProps) => {
    const [filters, setFilters] = useState<SearchCriteria>({
        propertyType: 'all',
        roomCount: 'any',
        priceRange: { min: '', max: '' },
        district: 'all',
        amenities: [],
        duration: '1-3',
    });

    // Функция для преобразования типа из формата фильтра в формат конфигурации
    const mapPropertyType = (type: string): PropertyType | null => {
        switch (type) {
            case 'apartment': return 'APARTMENT';
            case 'house': return 'HOUSE';
            case 'studio': return 'STUDIO';
            default: return null;
        }
    };

    useEffect(() => {
        if (searchCriteria) {
            setFilters(searchCriteria);
        }
    }, [searchCriteria]);

    const handlePriceChange = (field: 'min' | 'max', value: string) => {
        setFilters(prev => ({
            ...prev,
            priceRange: { ...prev.priceRange, [field]: value }
        }));
    };

    const handleAmenityToggle = (amenity: string) => {
        setFilters(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity]
        }));
    };

    // Очистка удобств при изменении типа жилья
    useEffect(() => {
        if (filters.propertyType !== 'all') {
            setFilters(prev => ({ ...prev, amenities: [] }));
        }
    }, [filters.propertyType]);

    const handleApply = () => {
        onApply(filters);
    };

    const handleReset = () => {
        setFilters({
            propertyType: 'all',
            roomCount: 'any',
            priceRange: { min: '', max: '' },
            district: 'all',
            amenities: [],
            duration: '1-3',
        });
    };

    // Получаем удобства для выбранного типа жилья
    const getCurrentAmenities = () => {
        if (filters.propertyType === 'all') return [];

        const propertyType = mapPropertyType(filters.propertyType);
        if (!propertyType) return [];

        return getAmenitiesByType(propertyType);
    };

    const currentAmenities = getCurrentAmenities();

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="p-6 border-b">
                    <div className="flex justify-between items-center">
                        <h3 className="text-xl font-bold">Фильтры</h3>
                        <button
                            onClick={onClose}
                            className="text-gray-500 hover:text-gray-700 text-2xl"
                        >
                            ×
                        </button>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Тип жилья */}
                    <div>
                        <h4 className="font-semibold mb-3">Тип жилья</h4>
                        <div className="grid grid-cols-2 gap-2">
                            {[
                                { value: 'all', label: 'Все варианты', emoji: '🔍' },
                                { value: 'apartment', label: 'Квартира', emoji: '🏢' },
                                { value: 'house', label: 'Дом', emoji: '🏠' },
                                { value: 'studio', label: 'Студия', emoji: '📐' },
                            ].map((type) => (
                                <button
                                    key={type.value}
                                    onClick={() => setFilters(prev => ({ ...prev, propertyType: type.value as any }))}
                                    className={`p-3 border-2 rounded-lg text-left transition-all ${filters.propertyType === type.value
                                        ? 'border-green-500 bg-green-50 text-green-700'
                                        : 'border-gray-300 hover:border-green-500'
                                        }`}
                                >
                                    <div className="flex items-center gap-2">
                                        <span>{type.emoji}</span>
                                        <span>{type.label}</span>
                                    </div>
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Количество комнат (только для квартир и студий) */}
                    {(filters.propertyType === 'apartment' || filters.propertyType === 'studio') && (
                        <div>
                            <h4 className="font-semibold mb-3">Количество комнат</h4>
                            <div className="grid grid-cols-3 gap-2">
                                {['1', '2', '3', '4+', 'any'].map((count) => (
                                    <button
                                        key={count}
                                        onClick={() => setFilters(prev => ({ ...prev, roomCount: count as any }))}
                                        className={`p-3 border-2 rounded-lg transition-all ${filters.roomCount === count
                                            ? 'border-green-500 bg-green-50 text-green-700'
                                            : 'border-gray-300 hover:border-green-500'
                                            }`}
                                    >
                                        {count === 'any' ? 'Любое' : `${count} комн.`}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Цена */}
                    <div>
                        <h4 className="font-semibold mb-3">Бюджет (₽ за сутки)</h4>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">От</label>
                                <input
                                    type="number"
                                    value={filters.priceRange.min}
                                    onChange={(e) => handlePriceChange('min', e.target.value)}
                                    placeholder="0"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                            <div>
                                <label className="block text-sm text-gray-600 mb-1">До</label>
                                <input
                                    type="number"
                                    value={filters.priceRange.max}
                                    onChange={(e) => handlePriceChange('max', e.target.value)}
                                    placeholder="10000"
                                    className="w-full p-2 border border-gray-300 rounded-lg"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Удобства (только если выбран конкретный тип жилья) */}
                    {filters.propertyType !== 'all' && currentAmenities.length > 0 && (
                        <div>
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-semibold">Удобства</h4>
                                <span className="text-xs text-gray-500">
                                    {filters.propertyType === 'apartment' && 'Для квартиры'}
                                    {filters.propertyType === 'house' && 'Для дома'}
                                    {filters.propertyType === 'studio' && 'Для студии'}
                                </span>
                            </div>
                            <div className="grid grid-cols-2 gap-2">
                                {currentAmenities.map((amenity) => (
                                    <button
                                        key={amenity.id}
                                        onClick={() => handleAmenityToggle(amenity.name)}
                                        className={`p-3 border-2 rounded-lg transition-all text-left ${filters.amenities.includes(amenity.name)
                                            ? 'border-green-500 bg-green-50 text-green-700'
                                            : 'border-gray-300 hover:border-green-500'
                                            }`}
                                    >
                                        {amenity.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                <div className="p-6 border-t bg-gray-50 flex justify-between">
                    <button
                        onClick={handleReset}
                        className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
                    >
                        Сбросить
                    </button>
                    <div className="flex gap-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-100 font-medium"
                        >
                            Отмена
                        </button>
                        <button
                            onClick={handleApply}
                            className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
                        >
                            Применить
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default FilterModal;