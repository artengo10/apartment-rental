// components/modals/AddApartmentWizard.tsx
'use client';

import { useState, useCallback, memo, useRef, useEffect, DragEvent } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getAmenitiesByType, type Amenity, type PropertyType } from '@/lib/amenities-config';
import { Upload, X, Loader2, Search, MapPin, AlertCircle, Calendar, DollarSign, ImageIcon } from 'lucide-react';

interface AddApartmentWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editingApartment?: any | null;
}

type WizardStep = 1 | 2 | 3 | 4;

interface ImageItem {
    file?: File;
    previewUrl: string;
    isExisting: boolean;
    originalUrl?: string;
}

interface FormData {
    title: string;
    description: string;
    price: string;
    type: PropertyType;
    district: string;
    address: string;
    lat: number | null;
    lng: number | null;
    rooms: string;
    area: string;
    floor: string;
    amenities: string[];
}

interface PricingRule {
    date: string;
    price: number;
}

// Конфигурация полей для каждого типа жилья
const getFieldsConfig = (type: PropertyType) => {
    const config = {
        showRooms: false,
        showArea: false,
        showFloor: false,
        roomsLabel: 'Комнаты',
        areaLabel: 'Площадь (м²)',
        floorLabel: 'Этаж'
    };

    switch (type) {
        case 'APARTMENT':
            config.showRooms = true;
            config.showFloor = true;
            config.showArea = false;
            break;
        case 'HOUSE':
            config.showRooms = true;
            config.showArea = true;
            config.showFloor = false;
            break;
        case 'STUDIO':
            config.showRooms = true;
            config.showFloor = true;
            config.showArea = false;
            break;
    }

    return config;
};

const AddressSuggest = memo(({ onAddressSelect, value, onChange }: any) => {
    const [suggestions, setSuggestions] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [showSuggestions, setShowSuggestions] = useState(false);
    const [regionError, setRegionError] = useState<string | null>(null);
    const inputRef = useRef<HTMLInputElement>(null);
    const timeoutRef = useRef<NodeJS.Timeout>();

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
                setShowSuggestions(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const fetchSuggestions = async (query: string) => {
        if (!query || query.length < 3) {
            setSuggestions([]);
            return;
        }
        setIsLoading(true);
        setRegionError(null);

        try {
            const response = await fetch(`/api/geocode/suggest?query=${encodeURIComponent(query)}`);
            if (response.ok) {
                const data = await response.json();
                if (data.results && data.results.length > 0) {
                    setSuggestions(data.results);
                    setShowSuggestions(true);
                } else {
                    setSuggestions([]);
                    setShowSuggestions(true);
                }
            } else {
                const error = await response.json();
                setRegionError(error.error || 'Ошибка при поиске адресов');
                setSuggestions([]);
            }
        } catch (error) {
            console.error('Error in address search:', error);
            setRegionError('Ошибка при поиске адресов');
            setSuggestions([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        onChange?.(value);
        setRegionError(null);
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
        timeoutRef.current = setTimeout(() => {
            fetchSuggestions(value);
        }, 500);
    };

    const handleSuggestionClick = async (suggestion: any) => {
        const address = suggestion.value;
        onChange?.(address);
        setShowSuggestions(false);
        setSuggestions([]);
        setRegionError(null);

        try {
            const lat = parseFloat(suggestion.data.geo_lat);
            const lng = parseFloat(suggestion.data.geo_lon);

            if (isNaN(lat) || isNaN(lng)) {
                throw new Error('Неверные координаты');
            }

            const isInRegion = checkNizhnyNovgorodRegion(lat, lng);
            if (isInRegion) {
                onAddressSelect(address, lat, lng);
            } else {
                setRegionError('Адрес должен находиться в Нижегородской области');
            }
        } catch (error) {
            console.error('Error selecting address:', error);
            setRegionError('Ошибка выбора адреса. Проверьте адрес.');
        }
    };

    const checkNizhnyNovgorodRegion = (lat: number, lng: number): boolean => {
        return lat >= 54.0 && lat <= 58.0 && lng >= 42.0 && lng <= 48.0;
    };

    useEffect(() => {
        return () => {
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
        };
    }, []);

    return (
        <div className="relative" ref={inputRef}>
            <div className="relative">
                <input
                    type="text"
                    value={value}
                    onChange={handleInputChange}
                    className={`w-full p-2 border rounded pl-10 ${regionError ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Введите адрес в Нижегородской области (например: Ногина 22)..."
                />
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            </div>

            {isLoading && (
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                </div>
            )}

            {regionError && (
                <div className="flex items-center gap-2 text-red-600 text-sm mt-1">
                    <AlertCircle className="w-4 h-4" /> {regionError}
                </div>
            )}

            {showSuggestions && suggestions.length > 0 && (
                <ul className="absolute z-50 w-full bg-white border border-gray-300 rounded-md mt-1 max-h-60 overflow-auto shadow-lg">
                    <li className="p-2 bg-blue-50 text-blue-700 text-sm font-medium border-b">
                        📍 Реальные адреса в Нижегородской области
                    </li>
                    {suggestions.map((suggestion, index) => (
                        <li
                            key={index}
                            onClick={() => handleSuggestionClick(suggestion)}
                            className="p-3 hover:bg-blue-50 cursor-pointer border-b border-gray-100 last:border-b-0 transition-colors"
                        >
                            <div className="flex items-start space-x-2">
                                <MapPin className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                                <div className="min-w-0">
                                    <div className="font-medium text-gray-900 truncate">
                                        {suggestion.value}
                                    </div>
                                    <div className="text-xs text-green-600 mt-1">
                                        ✅ Реальный адрес с карты
                                    </div>
                                </div>
                            </div>
                        </li>
                    ))}
                </ul>
            )}

            {showSuggestions && suggestions.length === 0 && !isLoading && value.length >= 3 && (
                <div className="absolute z-50 w-full bg-white border border-gray-300 rounded-md mt-1 p-4 text-center text-gray-500">
                    Адреса в Нижегородской области не найдены
                </div>
            )}

            <div className="text-xs text-gray-500 mt-2">
                🔍 Поиск реальных адресов: Нижний Новгород, Дзержинск, Арзамас, Бор, Кстово и другие города области
            </div>
        </div>
    );
});

const Step1 = memo(({ formData, handleInputChange }: any) => {
    const getAmenitiesHint = () => {
        switch (formData.type) {
            case 'APARTMENT':
                return 'Для квартиры доступны: Wi-Fi, Кондиционер, Стиральная машина, Телевизор, Мебель, Холодильник';
            case 'HOUSE':
                return 'Для дома доступны: Wi-Fi, Кондиционер, Баня/Сауна, Мангал/Гриль, Спортплощадка, Банный чан';
            case 'STUDIO':
                return 'Для студии доступны: Wi-Fi, Кухня, TV, Кондиционер, Стиральная машина, Парковка, Лифт, Балкон';
            default:
                return '';
        }
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Основная информация</h3>
            <div>
                <label className="block text-sm font-medium mb-1">Название объявления *</label>
                <input
                    type="text"
                    required
                    value={formData.title}
                    onChange={handleInputChange('title')}
                    className="w-full p-2 border rounded"
                    placeholder="Уютная квартира в центре города"
                />
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Описание *</label>
                <textarea
                    required
                    value={formData.description}
                    onChange={handleInputChange('description')}
                    className="w-full p-2 border rounded h-24"
                    placeholder="Опишите ваше жилье подробно..."
                />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Тип жилья *</label>
                    <select
                        value={formData.type}
                        onChange={handleInputChange('type')}
                        className="w-full p-2 border rounded"
                    >
                        <option value="APARTMENT">Квартира</option>
                        <option value="HOUSE">Дом</option>
                        <option value="STUDIO">Студия</option>
                    </select>
                    <div className="mt-2 text-xs text-gray-500">
                        {getAmenitiesHint()}
                    </div>
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Район *</label>
                    <input
                        type="text"
                        required
                        value={formData.district}
                        onChange={handleInputChange('district')}
                        className="w-full p-2 border rounded"
                        placeholder="Нижегородский район"
                    />
                </div>
            </div>
        </div>
    );
});

const Step2 = memo(({ formData, handleInputChange, handleNumberInputChange, handleCheckboxChange, handleAddressSelect }: any) => {
    const amenitiesList: Amenity[] = getAmenitiesByType(formData.type);
    const fieldsConfig = getFieldsConfig(formData.type);

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Детали и цена</h3>
            <div>
                <label className="block text-sm font-medium mb-1">Цена за сутки (₽) *</label>
                <input
                    type="number"
                    required
                    value={formData.price}
                    onChange={handleNumberInputChange('price')}
                    className="w-full p-2 border rounded"
                    placeholder="2500"
                    min="1"
                />
            </div>

            {/* Динамические поля */}
            <div className={`grid gap-4 ${(fieldsConfig.showRooms && fieldsConfig.showArea && fieldsConfig.showFloor) ? 'grid-cols-3' :
                (fieldsConfig.showRooms && (fieldsConfig.showArea || fieldsConfig.showFloor)) ? 'grid-cols-2' :
                    'grid-cols-1'}`}>
                {fieldsConfig.showRooms && (
                    <div>
                        <label className="block text-sm font-medium mb-1">Комнаты</label>
                        <input
                            type="number"
                            value={formData.rooms || ''}
                            onChange={handleNumberInputChange('rooms')}
                            className="w-full p-2 border rounded"
                            placeholder="2"
                            min="0"
                        />
                    </div>
                )}
                {fieldsConfig.showArea && (
                    <div>
                        <label className="block text-sm font-medium mb-1">Площадь (м²)</label>
                        <input
                            type="number"
                            value={formData.area || ''}
                            onChange={handleNumberInputChange('area')}
                            className="w-full p-2 border rounded"
                            placeholder="45"
                            min="1"
                        />
                    </div>
                )}
                {fieldsConfig.showFloor && (
                    <div>
                        <label className="block text-sm font-medium mb-1">Этаж</label>
                        <input
                            type="number"
                            value={formData.floor || ''}
                            onChange={handleNumberInputChange('floor')}
                            className="w-full p-2 border rounded"
                            placeholder="3"
                            min="0"
                        />
                    </div>
                )}
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Адрес в Нижегородской области *</label>
                <AddressSuggest
                    value={formData.address}
                    onChange={(value: string) => {
                        handleInputChange('address')({ target: { value } } as any);
                    }}
                    onAddressSelect={handleAddressSelect}
                />
                {formData.lat && formData.lng && (
                    <div className="text-sm text-green-600 mt-1">
                        ✅ Адрес подтвержден: {formData.lat.toFixed(6)}, {formData.lng.toFixed(6)}
                    </div>
                )}
                {formData.address && !formData.lat && (
                    <div className="text-sm text-yellow-600 mt-1">
                        ⚠️ Выберите адрес из списка для подтверждения
                    </div>
                )}
            </div>
            <div>
                <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-medium">Удобства</label>
                    <span className="text-xs text-gray-500">
                        {formData.type === 'APARTMENT' && 'Квартира'}
                        {formData.type === 'HOUSE' && 'Дом'}
                        {formData.type === 'STUDIO' && 'Студия'}
                    </span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    {amenitiesList.map((amenity: Amenity) => (
                        <label
                            key={amenity.id}
                            className="flex items-center space-x-3 p-2 border border-gray-200 rounded hover:bg-gray-50 transition-colors cursor-pointer"
                        >
                            <input
                                type="checkbox"
                                checked={formData.amenities.includes(amenity.name)}
                                onChange={handleCheckboxChange(amenity.name)}
                                className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                            />
                            <span className="text-sm text-gray-700">{amenity.label}</span>
                        </label>
                    ))}
                </div>
                {amenitiesList.length === 0 && (
                    <div className="text-sm text-yellow-600 mt-2">
                        Выберите тип жилья для отображения соответствующих удобств
                    </div>
                )}
            </div>
        </div>
    );
});

// components/modals/AddApartmentWizard.tsx - обновленный Step3
const Step3 = memo(({ formData, pricingRules, setPricingRules }: any) => {
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [datePrice, setDatePrice] = useState<string>('');
    const [selectedMonth, setSelectedMonth] = useState<number>(new Date().getMonth());
    const [selectedYear, setSelectedYear] = useState<number>(new Date().getFullYear());
    const [checkInTime, setCheckInTime] = useState<string>('14:00');
    const [checkOutTime, setCheckOutTime] = useState<string>('12:00');
    const [cleaningTime, setCleaningTime] = useState<number>(2); // Часы на уборку
    const [timeError, setTimeError] = useState<string | null>(null);

    // Вынесем эту функцию ВЫШЕ, чтобы она была доступна при генерации календаря
    const getPriceForDate = useCallback((date: string) => {
        if (!Array.isArray(pricingRules)) return parseInt(formData.price) || 0;
        const rule = pricingRules.find((rule: PricingRule) => rule.date === date);
        return rule ? rule.price : parseInt(formData.price) || 0;
    }, [pricingRules, formData.price]);

    // Валидация времени
    useEffect(() => {
        if (checkInTime && checkOutTime) {
            const [checkInHours, checkInMinutes] = checkInTime.split(':').map(Number);
            const [checkOutHours, checkOutMinutes] = checkOutTime.split(':').map(Number);

            const checkInTotal = checkInHours * 60 + checkInMinutes;
            const checkOutTotal = checkOutHours * 60 + checkOutMinutes;

            if (checkInTotal <= checkOutTotal) {
                setTimeError('Время заезда должно быть ПОСЛЕ времени выезда (минимум 1 час разницы)');
            } else if (checkInTotal - checkOutTotal < 60) {
                setTimeError('Минимальное время между выездом и заездом - 1 час для уборки');
            } else {
                setTimeError(null);
                // Автоматически рассчитываем время уборки
                const cleaningMinutes = checkInTotal - checkOutTotal;
                setCleaningTime(Math.ceil(cleaningMinutes / 60));
            }
        }
    }, [checkInTime, checkOutTime]);

    // Генерация дней месяца для календаря
    const generateCalendarDays = () => {
        const days = [];
        const firstDay = new Date(selectedYear, selectedMonth, 1);
        const lastDay = new Date(selectedYear, selectedMonth + 1, 0);
        const daysInMonth = lastDay.getDate();

        // Пустые дни в начале месяца
        const startDayOfWeek = firstDay.getDay();
        for (let i = 0; i < startDayOfWeek; i++) {
            days.push(null);
        }

        // Дни месяца
        for (let day = 1; day <= daysInMonth; day++) {
            const date = new Date(selectedYear, selectedMonth, day);
            const dateString = date.toISOString().split('T')[0];
            const today = new Date();
            const isToday = date.toDateString() === today.toDateString();
            const price = getPriceForDate(dateString);
            const isSpecialPrice = pricingRules && Array.isArray(pricingRules)
                ? pricingRules.some((rule: PricingRule) => rule.date === dateString)
                : false;

            days.push({
                date: dateString,
                day,
                isToday,
                price,
                isSpecialPrice
            });
        }

        return days;
    };

    const days = generateCalendarDays();

    const handleAddPricingRule = () => {
        if (!selectedDate || !datePrice || isNaN(parseInt(datePrice))) return;

        const price = parseInt(datePrice);
        const existingIndex = pricingRules.findIndex((rule: PricingRule) => rule.date === selectedDate);

        if (existingIndex >= 0) {
            const newRules = [...pricingRules];
            newRules[existingIndex] = { date: selectedDate, price };
            setPricingRules(newRules);
        } else {
            setPricingRules([...pricingRules, { date: selectedDate, price }]);
        }

        setDatePrice('');
    };

    const handleRemovePricingRule = (date: string) => {
        setPricingRules(pricingRules.filter((rule: PricingRule) => rule.date !== date));
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleDateString('ru-RU', {
            weekday: 'short',
            day: 'numeric',
            month: 'short'
        });
    };

    const monthNames = [
        'Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь',
        'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'
    ];

    const handlePrevMonth = () => {
        if (selectedMonth === 0) {
            setSelectedMonth(11);
            setSelectedYear(selectedYear - 1);
        } else {
            setSelectedMonth(selectedMonth - 1);
        }
    };

    const handleNextMonth = () => {
        if (selectedMonth === 11) {
            setSelectedMonth(0);
            setSelectedYear(selectedYear + 1);
        } else {
            setSelectedMonth(selectedMonth + 1);
        }
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
                <Calendar className="w-5 h-5" />
                Календарь цен и доступности
            </h3>

            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                    <div className="w-6 h-6 bg-green-100 border border-green-300 rounded flex items-center justify-center">
                        <DollarSign className="w-4 h-4 text-green-600" />
                    </div>
                    <p className="text-sm text-blue-800">
                        <strong>Автоматическое управление:</strong> Между гостями создается окно для уборки
                    </p>
                </div>
                <p className="text-sm text-blue-700">
                    Установите специальные цены на конкретные даты. Если цена не указана, будет использована базовая цена {parseInt(formData.price) || 0}₽.
                </p>
            </div>

            {/* Настройка времени заезда/выезда */}
            <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-medium mb-3">Настройка времени заезда и выезда</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium mb-1">Время выезда</label>
                        <input
                            type="time"
                            value={checkOutTime}
                            onChange={(e) => setCheckOutTime(e.target.value)}
                            className="w-full p-2 border rounded"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                            До этого времени предыдущий гость должен освободить жилье
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Время заезда</label>
                        <input
                            type="time"
                            value={checkInTime}
                            onChange={(e) => setCheckInTime(e.target.value)}
                            className="w-full p-2 border rounded"
                        />
                        <div className="text-xs text-gray-500 mt-1">
                            С этого времени новый гость может заехать
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium mb-1">Время на уборку</label>
                        <div className="flex items-center gap-2">
                            <div className="flex-1 p-2 bg-white border rounded">
                                {cleaningTime} часа(ов)
                            </div>
                            <button
                                type="button"
                                onClick={() => setCleaningTime(prev => Math.min(prev + 1, 24))}
                                className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                +
                            </button>
                            <button
                                type="button"
                                onClick={() => setCleaningTime(prev => Math.max(prev - 1, 1))}
                                className="px-3 py-2 bg-gray-200 rounded hover:bg-gray-300"
                            >
                                -
                            </button>
                        </div>
                        <div className="text-xs text-gray-500 mt-1">
                            Автоматически рассчитывается из времени заезда/выезда
                        </div>
                    </div>
                </div>

                {timeError && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
                        ⚠️ {timeError}
                    </div>
                )}

                {!timeError && (
                    <div className="mt-3 p-2 bg-green-50 border border-green-200 rounded text-green-700 text-sm">
                        ✅ Оптимальное время для уборки: с {checkOutTime} до {checkInTime} ({cleaningTime} час)
                    </div>
                )}

                <div className="mt-3 text-xs text-gray-600">
                    💡 <strong>Как это работает:</strong> Гость №1 выезжает до {checkOutTime} → {cleaningTime} часа на уборку → Гость №2 заезжает после {checkInTime}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Левая колонка: Календарь */}
                <div>
                    <div className="mb-4">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium">Выберите дату</h4>
                            <div className="flex items-center gap-2">
                                <button
                                    onClick={handlePrevMonth}
                                    className="p-1 hover:bg-gray-100 rounded"
                                    type="button"
                                >
                                    ←
                                </button>
                                <span className="font-medium">
                                    {monthNames[selectedMonth]} {selectedYear}
                                </span>
                                <button
                                    onClick={handleNextMonth}
                                    className="p-1 hover:bg-gray-100 rounded"
                                    type="button"
                                >
                                    →
                                </button>
                            </div>
                        </div>

                        <div className="border rounded-lg p-4">
                            <div className="grid grid-cols-7 gap-1 mb-2">
                                {['Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб', 'Вс'].map(day => (
                                    <div key={day} className="text-center text-xs font-medium text-gray-500">
                                        {day}
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-7 gap-1">
                                {days.map((day, index) => {
                                    if (!day) {
                                        return <div key={`empty-${index}`} className="p-2"></div>;
                                    }

                                    return (
                                        <button
                                            key={index}
                                            type="button"
                                            onClick={() => setSelectedDate(day.date)}
                                            className={`p-2 text-xs rounded border ${selectedDate === day.date
                                                    ? 'bg-blue-100 border-blue-500 text-blue-700'
                                                    : day.isSpecialPrice
                                                        ? 'bg-yellow-50 border-yellow-300 text-yellow-700'
                                                        : 'border-gray-200 hover:bg-gray-50'
                                                } ${day.isToday ? 'ring-1 ring-green-500' : ''}`}
                                        >
                                            <div className="font-medium">{day.day}</div>
                                            <div className="text-xs mt-1">{day.price}₽</div>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Управление ценой для выбранной даты */}
                    {selectedDate && (
                        <div className="border rounded-lg p-4 bg-gray-50">
                            <h4 className="font-medium mb-3">Настройка цены на {formatDate(selectedDate)}</h4>
                            <div className="flex gap-2">
                                <input
                                    type="number"
                                    value={datePrice}
                                    onChange={(e) => setDatePrice(e.target.value)}
                                    placeholder={`Базовая цена: ${parseInt(formData.price) || 0}₽`}
                                    className="flex-1 p-2 border rounded"
                                    min="0"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddPricingRule}
                                    className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700"
                                >
                                    Установить
                                </button>
                            </div>
                            {pricingRules.some((rule: PricingRule) => rule.date === selectedDate) && (
                                <button
                                    type="button"
                                    onClick={() => handleRemovePricingRule(selectedDate)}
                                    className="mt-3 text-sm text-red-600 hover:text-red-800"
                                >
                                    Сбросить к базовой цене
                                </button>
                            )}
                        </div>
                    )}
                </div>

                {/* Правая колонка: Список установленных цен */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <h4 className="font-medium">Установленные специальные цены</h4>
                        <span className="text-sm text-gray-500">
                            {pricingRules ? pricingRules.length : 0} {pricingRules && pricingRules.length === 1 ? 'дата' : pricingRules && pricingRules.length < 5 ? 'даты' : 'дат'}
                        </span>
                    </div>

                    {!pricingRules || pricingRules.length === 0 ? (
                        <div className="border rounded-lg p-8 text-center text-gray-500">
                            <Calendar className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                            <p>Специальные цены не установлены</p>
                            <p className="text-sm mt-1">Выберите дату слева и установите цену</p>
                        </div>
                    ) : (
                        <div className="border rounded-lg divide-y max-h-60 overflow-y-auto">
                            {pricingRules.map((rule: PricingRule, index: number) => (
                                <div key={index} className="p-3 flex items-center justify-between hover:bg-gray-50">
                                    <div>
                                        <div className="font-medium">{formatDate(rule.date)}</div>
                                        <div className="text-sm text-gray-500">
                                            {new Date(rule.date).toLocaleDateString('ru-RU', { year: 'numeric' })}
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3">
                                        <span className="font-bold text-green-600">{rule.price}₽</span>
                                        <button
                                            type="button"
                                            onClick={() => handleRemovePricingRule(rule.date)}
                                            className="text-red-500 hover:text-red-700"
                                        >
                                            <X className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Легенда */}
                    <div className="mt-4 space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                            <div className="w-4 h-4 border border-gray-200 rounded bg-white"></div>
                            <span>Базовая цена</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <div className="w-4 h-4 border border-yellow-300 rounded bg-yellow-50"></div>
                            <span>Специальная цена</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                            <div className="w-4 h-4 ring-1 ring-green-500 rounded bg-white"></div>
                            <span>Сегодня</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <h4 className="font-medium mb-2 text-yellow-800">📅 Логика бронирования с учетом времени:</h4>
                <ul className="text-sm text-yellow-700 space-y-1">
                    <li>• Если гость бронирует с 1 по 5 января, он должен выехать до {checkOutTime} 5 января</li>
                    <li>• Уборка: с {checkOutTime} 5 января до {checkInTime} 5 января ({cleaningTime} часа)</li>
                    <li>• Следующий гость может заехать после {checkInTime} 5 января</li>
                    <li>• <strong>Вы не теряете дни аренды</strong> - между гостями нет "пустых" дней</li>
                </ul>
            </div>
        </div>
    );
});

const Step4 = memo(({ allImages, setAllImages, isUploading }: any) => {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);
    const [dragOver, setDragOver] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
    };

    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (draggedIndex === null) return;

        const newImages = [...allImages];
        const draggedImage = newImages[draggedIndex];
        newImages.splice(draggedIndex, 1);
        newImages.splice(dropIndex, 0, draggedImage);

        setAllImages(newImages);
        setDraggedIndex(null);
    };

    const handleDeleteImage = (index: number, e: React.MouseEvent) => {
        e.stopPropagation();
        const newImages = [...allImages];

        if (!newImages[index].isExisting && newImages[index].previewUrl) {
            URL.revokeObjectURL(newImages[index].previewUrl);
        }

        newImages.splice(index, 1);
        setAllImages(newImages);
    };

    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    const closeLightbox = () => {
        setLightboxOpen(false);
    };

    const nextLightboxImage = () => {
        setLightboxIndex((prev) => (prev + 1) % allImages.length);
    };

    const prevLightboxImage = () => {
        setLightboxIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    };

    const handleFileSelect = (files: FileList | null) => {
        if (!files) return;

        const fileArray = Array.from(files);
        const validFiles = fileArray.filter(file =>
            file.type.startsWith('image/') &&
            file.size <= 10 * 1024 * 1024 // 10MB limit
        );

        const newImageObjects = validFiles.map((file: File) => ({
            file,
            previewUrl: URL.createObjectURL(file),
            isExisting: false,
        }));

        setAllImages((prev: ImageItem[]) => [...prev, ...newImageObjects].slice(0, 10));
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        handleFileSelect(e.target.files);
        e.target.value = ''; // Reset input
    };

    const handleDropFiles = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(false);
        handleFileSelect(e.dataTransfer.files);
    };

    const handleDragOverArea = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        setDragOver(true);
    };

    const handleDragLeave = () => {
        setDragOver(false);
    };

    const handleBrowseClick = () => {
        fileInputRef.current?.click();
    };

    return (
        <div className="space-y-6">
            <h3 className="text-lg font-semibold flex items-center gap-2">
                <ImageIcon className="w-5 h-5" />
                Фотографии жилья
            </h3>

            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-sm text-yellow-800">
                    📸 <strong>Рекомендация:</strong> Добавьте минимум 3 фотографии хорошего качества.
                    Первая фотография будет главной в объявлении.
                </p>
            </div>

            {/* Превью фотографий с возможностью перетаскивания */}
            {allImages.length > 0 && (
                <div className="mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h4 className="font-medium text-gray-700">
                                Загруженные фотографии: {allImages.length}/10
                            </h4>
                            {allImages[0] && (
                                <p className="text-sm text-green-600 mt-1">
                                    ✅ Первая фотография будет главной в объявлении
                                </p>
                            )}
                        </div>
                        {allImages.length < 10 && (
                            <button
                                type="button"
                                onClick={handleBrowseClick}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                            >
                                Добавить ещё
                            </button>
                        )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        {allImages.map((image: ImageItem, index: number) => (
                            <div
                                key={index}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDrop={(e) => handleDrop(e, index)}
                                onClick={() => openLightbox(index)}
                                className={`relative group rounded-lg border-2 overflow-hidden
                                    ${index === 0 ? 'ring-2 ring-green-500 border-green-500' : 'border-gray-200'}
                                    ${draggedIndex === index ? 'opacity-50' : ''}
                                    transition-all duration-200 cursor-move hover:scale-[1.02] hover:shadow-lg`}
                            >
                                {/* Главная метка */}
                                {index === 0 && (
                                    <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded z-10">
                                        Главная
                                    </div>
                                )}

                                {/* Иконка удаления */}
                                <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button
                                        type="button"
                                        onClick={(e) => handleDeleteImage(index, e)}
                                        className="w-8 h-8 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center shadow-lg"
                                        title="Удалить фото"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Изображение */}
                                <img
                                    src={image.previewUrl}
                                    alt={`Photo ${index + 1}`}
                                    className="w-full h-48 object-cover"
                                />

                                {/* Индикатор порядка */}
                                <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                                    #{index + 1}
                                </div>

                                {/* Подсказка при наведении */}
                                <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2">
                                    <div className="text-white text-center text-sm">
                                        <div className="mb-1">🖱️ Клик для просмотра</div>
                                        <div>↕️ Перетаскивайте для изменения порядка</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Инструкция */}
                    <div className="mt-4 p-3 bg-gray-50 rounded-lg">
                        <div className="text-sm text-gray-600 space-y-2">
                            <div className="flex items-center gap-2">
                                <span className="text-green-600">📸</span>
                                <span>Первая фотография — главная (отображается в карточке)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-red-500">🗑️</span>
                                <span>Наведите на фото и нажмите иконку для удаления</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-blue-600">👁️</span>
                                <span>Кликните на фото для просмотра в полном размере</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-purple-600">↕️</span>
                                <span>Перетаскивайте фото для изменения порядка</span>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Область для перетаскивания файлов */}
            <div
                className={`border-2 border-dashed rounded-lg p-8 text-center transition-all ${dragOver
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-300 hover:border-blue-400 hover:bg-gray-50'
                    } ${isUploading || allImages.length >= 10 ? 'opacity-50 cursor-not-allowed' : ''}`}
                onDrop={handleDropFiles}
                onDragOver={handleDragOverArea}
                onDragLeave={handleDragLeave}
                onClick={handleBrowseClick}
            >
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="apartment-images"
                    disabled={isUploading || allImages.length >= 10}
                    ref={fileInputRef}
                />

                <div className="flex flex-col items-center justify-center">
                    {isUploading ? (
                        <>
                            <Loader2 className="w-12 h-12 animate-spin text-blue-600 mb-4" />
                            <p className="text-lg font-medium text-gray-900">Загрузка изображений...</p>
                            <p className="text-sm text-gray-600 mt-1">Пожалуйста, подождите</p>
                        </>
                    ) : (
                        <>
                            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                                {dragOver ? (
                                    <Upload className="w-8 h-8 text-blue-600 animate-bounce" />
                                ) : (
                                    <ImageIcon className="w-8 h-8 text-blue-600" />
                                )}
                            </div>

                            <div className="mb-4">
                                <p className="text-lg font-medium text-gray-900">
                                    {allImages.length >= 10
                                        ? 'Достигнут лимит 10 фотографий'
                                        : dragOver
                                            ? 'Отпустите для загрузки'
                                            : 'Перетащите фото сюда или нажмите для выбора'
                                    }
                                </p>
                                <p className="text-sm text-gray-600 mt-1">
                                    PNG, JPG, JPEG до 10MB • Максимум 10 фото
                                </p>
                            </div>

                            {allImages.length < 10 && !dragOver && (
                                <button
                                    type="button"
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium transition-colors"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleBrowseClick();
                                    }}
                                >
                                    Выбрать файлы
                                </button>
                            )}

                            {allImages.length < 10 && (
                                <p className="text-sm text-blue-600 mt-4">
                                    Можно загрузить ещё {10 - allImages.length} {10 - allImages.length === 1 ? 'фото' : 'фото'}
                                </p>
                            )}
                        </>
                    )}
                </div>
            </div>

            {/* Требования к фотографиям */}
            <div className="bg-gray-50 rounded-lg p-4">
                <h4 className="font-medium mb-2 text-gray-700">Требования к фотографиям:</h4>
                <ul className="text-sm text-gray-600 space-y-1">
                    <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Минимум 3 фотографии</span>
                    </li>
                    <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Хорошее качество и освещение</span>
                    </li>
                    <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Покажите все комнаты и основные удобства</span>
                    </li>
                    <li className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>Первая фотография — самое лучшее фото жилья</span>
                    </li>
                </ul>
            </div>

            {/* Лайтбокс для просмотра фотографий */}
            {lightboxOpen && allImages.length > 0 && (
                <div className="fixed inset-0 bg-black/90 z-[100] flex items-center justify-center p-4">
                    <button
                        onClick={closeLightbox}
                        className="absolute top-4 right-4 text-white text-2xl hover:text-gray-300 z-10"
                    >
                        <X className="w-8 h-8" />
                    </button>

                    <button
                        onClick={prevLightboxImage}
                        className="absolute left-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
                    >
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20">←</div>
                    </button>

                    <button
                        onClick={nextLightboxImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
                    >
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20">→</div>
                    </button>

                    <div className="relative w-full max-w-4xl max-h-[80vh]">
                        <img
                            src={allImages[lightboxIndex]?.previewUrl}
                            alt={`Photo ${lightboxIndex + 1}`}
                            className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                        />
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-2 rounded-lg text-sm">
                            Фото {lightboxIndex + 1} из {allImages.length}
                            {lightboxIndex === 0 && <span className="ml-2 text-green-400">★ Главное фото</span>}
                        </div>
                    </div>

                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 overflow-x-auto max-w-full">
                        {allImages.map((image: ImageItem, index: number) => (
                            <button
                                key={index}
                                onClick={() => setLightboxIndex(index)}
                                className={`shrink-0 w-16 h-16 rounded overflow-hidden border-2 ${index === lightboxIndex ? 'border-blue-500' : 'border-transparent'}`}
                            >
                                <img
                                    src={image.previewUrl}
                                    alt={`Thumb ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
});

export default function AddApartmentWizard({ isOpen, onClose, onSuccess, editingApartment = null }: AddApartmentWizardProps) {
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState<WizardStep>(1);
    const [loading, setLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState<FormData>({
        title: '',
        description: '',
        price: '',
        type: 'APARTMENT',
        district: '',
        address: '',
        lat: null,
        lng: null,
        rooms: '',
        area: '',
        floor: '',
        amenities: [],
    });

    const [allImages, setAllImages] = useState<ImageItem[]>([]);
    const [pricingRules, setPricingRules] = useState<PricingRule[]>([]);

    useEffect(() => {
        return () => {
            allImages.forEach(img => {
                if (!img.isExisting && img.previewUrl) {
                    URL.revokeObjectURL(img.previewUrl);
                }
            });
        };
    }, [allImages]);


    

    useEffect(() => {
        if (editingApartment) {
            setFormData({
                title: editingApartment.title || '',
                description: editingApartment.description || '',
                price: editingApartment.price ? String(editingApartment.price || '').replace('₽', '').trim() : '',
                type: (editingApartment.type?.toUpperCase() || 'APARTMENT') as PropertyType,
                district: editingApartment.district || '',
                address: editingApartment.address || '',
                lat: editingApartment.lat || null,
                lng: editingApartment.lng || null,
                rooms: editingApartment.rooms?.toString() || '',
                area: editingApartment.area?.toString() || '',
                floor: editingApartment.floor?.toString() || '',
                amenities: editingApartment.amenities || [],
            });

            if (editingApartment.images && Array.isArray(editingApartment.images)) {
                const existingImagesArray = editingApartment.images.map((url: string) => ({
                    previewUrl: url,
                    originalUrl: url,
                    isExisting: true,
                }));
                setAllImages(existingImagesArray);
            } else {
                setAllImages([]);
            }

            // Загрузка существующих цен
            if (editingApartment.pricingRules && Array.isArray(editingApartment.pricingRules)) {
                const rules = editingApartment.pricingRules.map((rule: any) => ({
                    date: new Date(rule.date).toISOString().split('T')[0],
                    price: rule.price
                }));
                setPricingRules(rules);
            }
        } else {
            setFormData({
                title: '', description: '', price: '', type: 'APARTMENT', district: '', address: '',
                lat: null, lng: null, rooms: '', area: '', floor: '', amenities: [],
            });
            setAllImages([]);
            setPricingRules([]);
        }
    }, [editingApartment]);

    const handleInputChange = useCallback((field: keyof FormData) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            const value = e.target.value;

            if (field === 'type') {
                const newType = value as PropertyType;
                const resetFields: Partial<FormData> = { amenities: [] };

                switch (newType) {
                    case 'APARTMENT':
                        resetFields.area = '';
                        break;
                    case 'HOUSE':
                        resetFields.floor = '';
                        break;
                    case 'STUDIO':
                        resetFields.area = '';
                        break;
                }

                setFormData(prev => ({
                    ...prev,
                    [field]: newType,
                    ...resetFields
                }));
            } else {
                setFormData(prev => ({ ...prev, [field]: value }));
            }
        }, []);

    const handleNumberInputChange = useCallback((field: keyof FormData) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            const value = e.target.value;
            setFormData(prev => ({ ...prev, [field]: value === '' ? '' : value }));
        }, []);

    const handleCheckboxChange = useCallback((amenity: string) =>
        (e: React.ChangeEvent<HTMLInputElement>) => {
            setFormData(prev => ({
                ...prev,
                amenities: e.target.checked
                    ? [...prev.amenities, amenity]
                    : prev.amenities.filter(a => a !== amenity)
            }));
        }, []);

    const handleAddressSelect = useCallback((address: string, lat: number, lng: number) => {
        setFormData(prev => ({ ...prev, address, lat, lng }));
    }, []);

    const validateStep = (step: WizardStep): boolean => {
        switch (step) {
            case 1:
                return !!(formData.title && formData.description && formData.district);
            case 2:
                return !!(formData.price && formData.address && formData.lat && formData.lng);
            case 3:
                return true; // Календарь не обязателен
            case 4:
                return allImages.length >= 3; // Минимум 3 фото
            default:
                return false;
        }
    };

    const handleSubmit = async () => {
        if (!user) return;
        setLoading(true);
        setIsUploading(true);

        try {
            const formDataToSend = new FormData();
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('price', formData.price);
            formDataToSend.append('type', formData.type);
            formDataToSend.append('district', formData.district);
            formDataToSend.append('address', formData.address);
            if (formData.lat) formDataToSend.append('lat', formData.lat.toString());
            if (formData.lng) formDataToSend.append('lng', formData.lng.toString());

            if (formData.rooms) formDataToSend.append('rooms', formData.rooms);
            if (formData.area && (formData.type === 'HOUSE')) {
                formDataToSend.append('area', formData.area);
            }
            if (formData.floor && (formData.type === 'APARTMENT' || formData.type === 'STUDIO')) {
                formDataToSend.append('floor', formData.floor);
            }

            formData.amenities.forEach(amenity => formDataToSend.append('amenities', amenity));

            // Добавляем правила ценообразования
            if (pricingRules.length > 0) {
                formDataToSend.append('pricingRules', JSON.stringify(pricingRules));
            }

            const existingImagesUrls = allImages
                .filter(img => img.isExisting && img.originalUrl)
                .map(img => img.originalUrl!);

            existingImagesUrls.forEach(url => {
                formDataToSend.append('existingImages', url);
            });

            const newImageFiles = allImages
                .filter(img => !img.isExisting && img.file)
                .map(img => img.file!);

            newImageFiles.forEach(file => {
                formDataToSend.append('images', file);
            });

            if (existingImagesUrls.length === 0 && newImageFiles.length === 0) {
                alert('❌ Добавьте хотя бы одно изображение');
                setIsUploading(false);
                setLoading(false);
                return;
            }

            if (allImages.length < 3) {
                alert('❌ Добавьте минимум 3 фотографии');
                setIsUploading(false);
                setLoading(false);
                return;
            }

            const token = localStorage.getItem('auth_token');
            const url = editingApartment ? `/api/apartments/${editingApartment.id}` : '/api/apartments';
            const method = editingApartment ? 'PATCH' : 'POST';

            const response = await fetch(url, {
                method,
                headers: { 'Authorization': `Bearer ${token}` },
                body: formDataToSend,
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Успешный ответ:', result);

                allImages.forEach(img => {
                    if (!img.isExisting && img.previewUrl) {
                        URL.revokeObjectURL(img.previewUrl);
                    }
                });

                alert(editingApartment
                    ? '✅ Объявление обновлено и отправлено на повторную модерацию!'
                    : '✅ Объявление отправлено на модерацию!');

                onSuccess();
                onClose();

                setFormData({
                    title: '', description: '', price: '', type: 'APARTMENT', district: '', address: '',
                    lat: null, lng: null, rooms: '', area: '', floor: '', amenities: [],
                });
                setAllImages([]);
                setPricingRules([]);
                setCurrentStep(1);
            } else {
                const errorData = await response.json();
                alert(`❌ Ошибка: ${errorData.error || 'Неизвестная ошибка'}`);
            }
        } catch (error) {
            console.error('Error:', error);
            alert('❌ Произошла ошибка при отправке объявления');
        } finally {
            setLoading(false);
            setIsUploading(false);
        }
    };

    const nextStep = () => {
        if (currentStep < 4 && validateStep(currentStep)) {
            setCurrentStep((currentStep + 1) as WizardStep);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep((currentStep - 1) as WizardStep);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-4 sm:p-6 w-full max-w-[95vw] sm:max-w-4xl max-h-[85vh] sm:max-h-[90vh] overflow-y-auto">                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">
                        {editingApartment ? 'Редактировать жилье' : 'Добавить жилье'}
                    </h2>
                    <div className="flex space-x-2">
                        {[1, 2, 3, 4].map((step) => (
                            <div key={step} className={`w-3 h-3 rounded-full ${step === currentStep ? 'bg-blue-600' : 'bg-gray-300'}`} />
                        ))}
                    </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                    <p className="text-sm text-blue-800 flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        <strong>Только для Нижегородской области:</strong> Нижний Новгород, Дзержинск, Арзамас, Бор, Кстово и другие города региона
                    </p>
                </div>

                {currentStep === 1 && <Step1 formData={formData} handleInputChange={handleInputChange} />}
                {currentStep === 2 && (
                    <Step2
                        formData={formData}
                        handleInputChange={handleInputChange}
                        handleNumberInputChange={handleNumberInputChange}
                        handleCheckboxChange={handleCheckboxChange}
                        handleAddressSelect={handleAddressSelect}
                    />
                )}
                {currentStep === 3 && (
                    <Step3
                        formData={formData}
                        pricingRules={pricingRules}
                        setPricingRules={setPricingRules}
                    />
                )}
                {currentStep === 4 && (
                    <Step4
                        allImages={allImages}
                        setAllImages={setAllImages}
                        isUploading={isUploading}
                    />
                )}

                <div className="flex justify-between pt-6 mt-6 border-t">
                    <button
                        type="button"
                        onClick={currentStep === 1 ? onClose : prevStep}
                        disabled={loading}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50"
                    >
                        {currentStep === 1 ? 'Отмена' : 'Назад'}
                    </button>
                    {currentStep < 4 ? (
                        <button
                            type="button"
                            onClick={nextStep}
                            disabled={!validateStep(currentStep)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Далее
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading || !validateStep(4)}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Отправка...' : (editingApartment ? 'Обновить и отправить на модерацию' : 'Отправить на модерацию')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
