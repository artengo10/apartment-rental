// components/SmartSearch.tsx
'use client';
import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';

type PropertyType = 'apartment' | 'house' | 'studio' | 'all';
type RoomCount = '1' | '2' | '3' | '4+' | 'any';

// Начальное состояние вынесено в константу
const initialSearchData = {
    propertyType: '' as PropertyType,
    roomCount: '' as RoomCount,
    priceRange: { min: '', max: '' },
    district: 'sormovo',
    amenities: [] as string[],
    duration: '1-3',
    houseArea: '',
    houseFloors: '1',
    hasGarden: false,
    hasGarage: false,
    hasSauna: false,
    parkingSpaces: '1',
};

const SmartSearch = () => {
    const router = useRouter();
    const pathname = usePathname();
    const [currentStep, setCurrentStep] = useState(1);
    const [searchData, setSearchData] = useState(initialSearchData);

    const totalApartments = 100;

    // СБРОС СОСТОЯНИЯ ПРИ ПЕРЕХОДЕ НА ГЛАВНУЮ
    useEffect(() => {
        setCurrentStep(1);
        setSearchData(initialSearchData);
    }, [pathname]);

    const handlePropertyTypeSelect = (type: PropertyType) => {
        if (type === 'all') {
            // Для "Все варианты" сразу сохраняем и переходим
            const allCriteria = {
                ...initialSearchData,
                propertyType: 'all'
            };

            console.log('Searching all properties with criteria:', allCriteria);
            sessionStorage.setItem('searchCriteria', JSON.stringify(allCriteria));
            router.push('/results');
            return;
        }

        setSearchData(prev => ({ ...prev, propertyType: type }));

        if (type === 'studio') {
            setCurrentStep(3);
        } else if (type === 'house') {
            setCurrentStep(2.5);
        } else {
            setCurrentStep(2);
        }
    };

    const handleRoomCountSelect = (count: RoomCount) => {
        setSearchData(prev => ({ ...prev, roomCount: count }));
    };

    const handleHouseParamChange = (field: string, value: any) => {
        setSearchData(prev => ({ ...prev, [field]: value }));
    };

    const handlePriceChange = (field: 'min' | 'max', value: string) => {
        setSearchData(prev => ({
            ...prev,
            priceRange: { ...prev.priceRange, [field]: value }
        }));
    };

    const handleAmenityToggle = (amenity: string) => {
        setSearchData(prev => ({
            ...prev,
            amenities: prev.amenities.includes(amenity)
                ? prev.amenities.filter(a => a !== amenity)
                : [...prev.amenities, amenity]
        }));
    };

    const handleHouseAmenityToggle = (amenity: string) => {
        setSearchData(prev => ({
            ...prev,
            [amenity]: !prev[amenity as keyof typeof prev]
        }));
    };

    const handleSearch = () => {
        console.log('Search data:', searchData);
        sessionStorage.setItem('searchCriteria', JSON.stringify(searchData));
        router.push('/results');
    };

    const progressPercentage = (currentStep / 4) * 100;

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-lg border-2 border-black p-6 sm:p-8 shadow-lg">
            {/* Уведомление с количеством квартир */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-center">
                <p className="text-blue-800 font-medium">
                    🏠 Доступно {totalApartments.toLocaleString()} вариантов жилья в Нижнем Новгороде
                </p>
            </div>

            {/* Прогресс-бар */}
            <div className="mb-8">
                <div className="flex justify-between text-sm text-gray-600 mb-2">
                    <span>Шаг {Math.floor(currentStep)} из 4</span>
                    <span>{Math.round(progressPercentage)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                        className="bg-green-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${progressPercentage}%` }}
                    ></div>
                </div>
            </div>

            {/* Шаг 1: Выбор типа жилья */}
            {currentStep === 1 && (
                <div className="text-center">
                    <h3 className="text-xl font-bold mb-6">Что вы ищете?</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <button
                            onClick={() => handlePropertyTypeSelect('apartment')}
                            className="p-6 border-2 border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all flex flex-col items-center"
                        >
                            <div className="text-3xl mb-3">🏢</div>
                            <span className="font-semibold">Квартира</span>
                            <span className="text-sm text-gray-600 mt-1">Отдельная квартира</span>
                        </button>

                        <button
                            onClick={() => handlePropertyTypeSelect('house')}
                            className="p-6 border-2 border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all flex flex-col items-center"
                        >
                            <div className="text-3xl mb-3">🏠</div>
                            <span className="font-semibold">Дом</span>
                            <span className="text-sm text-gray-600 mt-1">Частный дом</span>
                        </button>

                        <button
                            onClick={() => handlePropertyTypeSelect('studio')}
                            className="p-6 border-2 border-gray-300 rounded-lg hover:border-green-500 hover:bg-green-50 transition-all flex flex-col items-center"
                        >
                            <div className="text-3xl mb-3">📐</div>
                            <span className="font-semibold">Студия</span>
                            <span className="text-sm text-gray-600 mt-1">Помещение-студия</span>
                        </button>

                        <button
                            onClick={() => handlePropertyTypeSelect('all')}
                            className="p-6 border-2 border-blue-300 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-all flex flex-col items-center"
                        >
                            <div className="text-3xl mb-3">🔍</div>
                            <span className="font-semibold">Все варианты</span>
                            <span className="text-sm text-gray-600 mt-1">Показать все варианты</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Остальные шаги остаются без изменений */}
            {/* Шаг 2: Количество комнат (только для квартир) */}
            {currentStep === 2 && searchData.propertyType === 'apartment' && (
                <div className="text-center">
                    <h3 className="text-xl font-bold mb-6">Сколько комнат нужно?</h3>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 mb-8">
                        {(['1', '2', '3', '4+', 'any'] as RoomCount[]).map((count) => (
                            <button
                                key={count}
                                onClick={() => handleRoomCountSelect(count)}
                                className={`p-4 border-2 rounded-lg transition-all font-semibold ${searchData.roomCount === count
                                    ? 'border-green-500 bg-green-50 text-green-700'
                                    : 'border-gray-300 hover:border-green-500'
                                    }`}
                            >
                                {count === 'any' ? 'Любое' : `${count} ${getRoomWord(count)}`}
                            </button>
                        ))}
                    </div>

                    <div className="flex justify-between items-center">
                        <button
                            onClick={() => setCurrentStep(1)}
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors text-sm"
                        >
                            Назад
                        </button>
                        <button
                            onClick={() => setCurrentStep(3)}
                            className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                        >
                            Далее
                        </button>
                        <button
                            onClick={() => setCurrentStep(3)}
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors text-sm"
                        >
                            Пропустить
                        </button>
                    </div>
                </div>
            )}

            {/* Шаг 2.5: Параметры дома */}
            {currentStep === 2.5 && searchData.propertyType === 'house' && (
                <div>
                    <h3 className="text-xl font-bold mb-6 text-center">Параметры дома</h3>
                    <div className="space-y-4 mb-8">
                        <div>
                            <label className="block text-sm font-medium mb-2">Примерная площадь дома (м²)</label>
                            <input
                                type="number"
                                value={searchData.houseArea}
                                onChange={(e) => handleHouseParamChange('houseArea', e.target.value)}
                                placeholder="Например: 120"
                                className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Этажность</label>
                            <div className="grid grid-cols-3 gap-2">
                                {['1', '2', '3+'].map(floors => (
                                    <button
                                        key={floors}
                                        onClick={() => handleHouseParamChange('houseFloors', floors)}
                                        className={`p-3 border-2 rounded-lg transition-all ${searchData.houseFloors === floors
                                            ? 'border-green-500 bg-green-50 text-green-700'
                                            : 'border-gray-300 hover:border-green-500'
                                            }`}
                                    >
                                        {floors} этаж{floors === '1' ? '' : 'а'}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { key: 'hasGarden', label: '🏡 Участок' },
                                { key: 'hasGarage', label: '🚗 Гараж' },
                                { key: 'hasSauna', label: '🧖 Баня/Сауна' },
                            ].map((item) => (
                                <button
                                    key={item.key}
                                    onClick={() => handleHouseAmenityToggle(item.key)}
                                    className={`p-3 border-2 rounded-lg transition-all ${searchData[item.key as keyof typeof searchData]
                                        ? 'border-green-500 bg-green-50 text-green-700'
                                        : 'border-gray-300 hover:border-green-500'
                                        }`}
                                >
                                    {item.label}
                                </button>
                            ))}
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-2">Парковочные места</label>
                            <div className="grid grid-cols-4 gap-2">
                                {['1', '2', '3', '4+'].map(spaces => (
                                    <button
                                        key={spaces}
                                        onClick={() => handleHouseParamChange('parkingSpaces', spaces)}
                                        className={`p-3 border-2 rounded-lg transition-all ${searchData.parkingSpaces === spaces
                                            ? 'border-green-500 bg-green-50 text-green-700'
                                            : 'border-gray-300 hover:border-green-500'
                                            }`}
                                    >
                                        {spaces}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <button
                            onClick={() => setCurrentStep(1)}
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors text-sm"
                        >
                            Назад
                        </button>
                        <button
                            onClick={() => setCurrentStep(3)}
                            className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                        >
                            Далее
                        </button>
                        <button
                            onClick={() => setCurrentStep(3)}
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors text-sm"
                        >
                            Пропустить
                        </button>
                    </div>
                </div>
            )}

            {/* Шаг 3: Бюджет */}
            {currentStep === 3 && (
                <div>
                    <h3 className="text-xl font-bold mb-6 text-center">Ваш бюджет?</h3>
                    <div className="space-y-4 mb-8">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">От (₽)</label>
                                <input
                                    type="number"
                                    value={searchData.priceRange.min}
                                    onChange={(e) => handlePriceChange('min', e.target.value)}
                                    placeholder="1000"
                                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">До (₽)</label>
                                <input
                                    type="number"
                                    value={searchData.priceRange.max}
                                    onChange={(e) => handlePriceChange('max', e.target.value)}
                                    placeholder="5000"
                                    className="w-full p-3 border-2 border-gray-300 rounded-lg focus:border-green-500"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-2">
                            {[
                                { label: 'Эконом', min: '500', max: '1500' },
                                { label: 'Стандарт', min: '1500', max: '3000' },
                                { label: 'Премиум', min: '3000', max: '10000' }
                            ].map((option) => (
                                <button
                                    key={option.label}
                                    onClick={() => {
                                        handlePriceChange('min', option.min);
                                        handlePriceChange('max', option.max);
                                    }}
                                    className="p-3 border-2 border-gray-300 rounded-lg hover:border-green-500 text-sm"
                                >
                                    {option.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <button
                            onClick={() => setCurrentStep(searchData.propertyType === 'house' ? 2.5 : 2)}
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors text-sm"
                        >
                            Назад
                        </button>
                        <button
                            onClick={() => setCurrentStep(4)}
                            className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                        >
                            Далее
                        </button>
                        <button
                            onClick={() => setCurrentStep(4)}
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors text-sm"
                        >
                            Пропустить
                        </button>
                    </div>
                </div>
            )}

            {/* Шаг 4: Дополнительные опции */}
            {currentStep === 4 && (
                <div>
                    <h3 className="text-xl font-bold mb-6 text-center">
                        {searchData.propertyType === 'house' ? 'Дополнительные удобства' : 'Что важно для вас?'}
                    </h3>
                    <div className="space-y-4 mb-8">
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            {searchData.propertyType === 'house' ? (
                                [
                                    'Бассейн', 'Камин', 'Терраса',
                                    'Охрана', 'Детская площадка', 'Спортзал'
                                ].map((amenity) => (
                                    <button
                                        key={amenity}
                                        onClick={() => handleAmenityToggle(amenity)}
                                        className={`p-3 border-2 rounded-lg transition-all ${searchData.amenities.includes(amenity)
                                            ? 'border-green-500 bg-green-50 text-green-700'
                                            : 'border-gray-300 hover:border-green-500'
                                            }`}
                                    >
                                        {amenity}
                                    </button>
                                ))
                            ) : (
                                [
                                    'Wi-Fi', 'Кухня', 'TV', 'Кондиционер',
                                    'Стиральная машина', 'Парковка', 'Лифт', 'Балкон'
                                ].map((amenity) => (
                                    <button
                                        key={amenity}
                                        onClick={() => handleAmenityToggle(amenity)}
                                        className={`p-3 border-2 rounded-lg transition-all ${searchData.amenities.includes(amenity)
                                            ? 'border-green-500 bg-green-50 text-green-700'
                                            : 'border-gray-300 hover:border-green-500'
                                            }`}
                                    >
                                        {amenity}
                                    </button>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="flex justify-between items-center">
                        <button
                            onClick={() => setCurrentStep(3)}
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg font-semibold hover:bg-gray-600 transition-colors text-sm"
                        >
                            Назад
                        </button>
                        <button
                            onClick={handleSearch}
                            className="bg-green-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors"
                        >
                            Найти жилье
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

const getRoomWord = (count: RoomCount): string => {
    if (count === '1') return 'комната';
    if (count === '2' || count === '3') return 'комнаты';
    return 'комнат';
};

export default SmartSearch;