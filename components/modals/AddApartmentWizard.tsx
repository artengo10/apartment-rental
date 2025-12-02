// components/modals/AddApartmentWizard.tsx
'use client';

import { useState, useCallback, memo, useRef, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Upload, X, Image as ImageIcon, Loader2, Search, MapPin, AlertCircle } from 'lucide-react';

interface AddApartmentWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    editingApartment?: any | null;
}

type WizardStep = 1 | 2 | 3;

// Тип для изображений
interface ImageItem {
    file?: File;
    previewUrl: string;
    isExisting: boolean;
    originalUrl?: string;
}


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
                console.log('Suggest API response:', data);

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
            // Получаем координаты для выбранного адреса
            const lat = parseFloat(suggestion.data.geo_lat);
            const lng = parseFloat(suggestion.data.geo_lon);

            if (isNaN(lat) || isNaN(lng)) {
                throw new Error('Неверные координаты');
            }

            // Проверяем, что адрес в Нижегородской области
            const isInRegion = checkNizhnyNovgorodRegion(lat, lng);

            if (isInRegion) {
                onAddressSelect(address, lat, lng);
                console.log('Адрес подтвержден:', address, lat, lng);
            } else {
                setRegionError('Адрес должен находиться в Нижегородской области');
            }
        } catch (error) {
            console.error('Error selecting address:', error);
            setRegionError('Ошибка выбора адреса. Проверьте адрес.');
        }
    };

    // Функция проверки, что координаты в Нижегородской области
    const checkNizhnyNovgorodRegion = (lat: number, lng: number): boolean => {
        // Приблизительные границы Нижегородской области
        return (
            lat >= 54.0 && lat <= 58.0 &&
            lng >= 42.0 && lng <= 48.0
        );
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

            {value && value.length < 3 && (
                <div className="text-sm text-gray-500 mt-1">
                    Введите минимум 3 символа для поиска
                </div>
            )}

            <div className="text-xs text-gray-500 mt-2">
                🔍 Поиск реальных адресов: Нижний Новгород, Дзержинск, Арзамас, Бор, Кстово и другие города области
            </div>

            {value && value.length >= 3 && !isLoading && (
                <div className="text-xs text-blue-600 mt-1">
                    📍 Выберите адрес из списка для автоматического определения координат на карте
                </div>
            )}
        </div>
    );
});

const Step1 = memo(({ formData, handleInputChange }: any) => (
    <div className="space-y-4">
        <h3 className="text-lg font-semibold">Основная информация</h3>
        <div>
            <label className="block text-sm font-medium mb-1">Название объявления *</label>
            <input type="text" required value={formData.title} onChange={handleInputChange('title')}
                className="w-full p-2 border rounded" placeholder="Уютная квартира в центре города" />
        </div>
        <div>
            <label className="block text-sm font-medium mb-1">Описание *</label>
            <textarea required value={formData.description} onChange={handleInputChange('description')}
                className="w-full p-2 border rounded h-24" placeholder="Опишите ваше жилье подробно..." />
        </div>
        <div className="grid grid-cols-2 gap-4">
            <div>
                <label className="block text-sm font-medium mb-1">Тип жилья *</label>
                <select value={formData.type} onChange={handleInputChange('type')} className="w-full p-2 border rounded">
                    <option value="APARTMENT">Квартира</option>
                    <option value="HOUSE">Дом</option>
                    <option value="STUDIO">Студия</option>
                </select>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Район *</label>
                <input type="text" required value={formData.district} onChange={handleInputChange('district')}
                    className="w-full p-2 border rounded" placeholder="Нижегородский район" />
            </div>
        </div>
    </div>
));

const Step2 = memo(({ formData, handleInputChange, handleNumberInputChange, handleCheckboxChange, handleAddressSelect }: any) => {
    const amenitiesList = ['WiFi', 'TV', 'Kitchen', 'Air conditioning', 'Heating', 'Washing machine', 'Parking'];
    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Детали и цена</h3>
            <div>
                <label className="block text-sm font-medium mb-1">Цена за сутки (₽) *</label>
                <input type="number" required value={formData.price} onChange={handleNumberInputChange('price')}
                    className="w-full p-2 border rounded" placeholder="2500" min="1" />
            </div>
            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Комнаты</label>
                    <input type="number" value={formData.rooms || ''} onChange={handleNumberInputChange('rooms')}
                        className="w-full p-2 border rounded" placeholder="2" min="0" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Площадь (м²)</label>
                    <input type="number" value={formData.area || ''} onChange={handleNumberInputChange('area')}
                        className="w-full p-2 border rounded" placeholder="45" min="1" />
                </div>
                <div>
                    <label className="block text-sm font-medium mb-1">Этаж</label>
                    <input type="number" value={formData.floor || ''} onChange={handleNumberInputChange('floor')}
                        className="w-full p-2 border rounded" placeholder="3" min="0" />
                </div>
            </div>
            <div>
                <label className="block text-sm font-medium mb-1">Адрес в Нижегородской области *</label>
                <AddressSuggest value={formData.address} onChange={(value: string) => {
                    handleInputChange('address')({ target: { value } } as any);
                }} onAddressSelect={handleAddressSelect} />
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
                <label className="block text-sm font-medium mb-2">Удобства</label>
                <div className="grid grid-cols-2 gap-2">
                    {amenitiesList.map(amenity => (
                        <label key={amenity} className="flex items-center space-x-2">
                            <input type="checkbox" checked={formData.amenities.includes(amenity)}
                                onChange={handleCheckboxChange(amenity)} className="rounded" />
                            <span className="text-sm">{amenity}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
});

const Step3 = memo(({ allImages, setAllImages, isUploading }: any) => {
    const [draggedIndex, setDraggedIndex] = useState<number | null>(null);
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [lightboxIndex, setLightboxIndex] = useState(0);

    // Обработчик начала перетаскивания
    const handleDragStart = (index: number) => {
        setDraggedIndex(index);
    };

    // Обработчик перетаскивания над элементом
    const handleDragOver = (e: React.DragEvent, index: number) => {
        e.preventDefault();
    };

    // Обработчик отпускания
    const handleDrop = (e: React.DragEvent, dropIndex: number) => {
        e.preventDefault();
        if (draggedIndex === null) return;

        const newImages = [...allImages];
        const draggedImage = newImages[draggedIndex];

        // Удаляем из старой позиции
        newImages.splice(draggedIndex, 1);
        // Вставляем в новую позицию
        newImages.splice(dropIndex, 0, draggedImage);

        setAllImages(newImages);
        setDraggedIndex(null);
    };

    // Удаление одной фотографии
    const handleDeleteImage = (index: number, e: React.MouseEvent) => {
        e.stopPropagation(); // Останавливаем всплытие, чтобы не открывался лайтбокс

        const newImages = [...allImages];

        // Очищаем ObjectURL для новых изображений
        if (!newImages[index].isExisting && newImages[index].previewUrl) {
            URL.revokeObjectURL(newImages[index].previewUrl);
        }

        newImages.splice(index, 1);
        setAllImages(newImages);
    };

    // Открытие лайтбокса
    const openLightbox = (index: number) => {
        setLightboxIndex(index);
        setLightboxOpen(true);
    };

    // Закрытие лайтбокса
    const closeLightbox = () => {
        setLightboxOpen(false);
    };

    // Следующее фото в лайтбоксе
    const nextLightboxImage = () => {
        setLightboxIndex((prev) => (prev + 1) % allImages.length);
    };

    // Предыдущее фото в лайтбоксе
    const prevLightboxImage = () => {
        setLightboxIndex((prev) => (prev - 1 + allImages.length) % allImages.length);
    };

    // Загрузка новых файлов
    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files || []);

        const newImageObjects = files.map((file: File) => ({
            file,
            previewUrl: URL.createObjectURL(file),
            isExisting: false,
        }));

        setAllImages((prev: any[]) => [...prev, ...newImageObjects].slice(0, 10));
    };

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Фотографии</h3>
            <p className="text-sm text-gray-600">
                Первая фотография будет главной в объявлении. Перетаскивайте фото для изменения порядка.
            </p>

            {/* Превью фотографий с возможностью перетаскивания */}
            {allImages.length > 0 && (
                <div className="mb-4">
                    <div className="mb-2">
                        <p className="text-sm font-medium text-gray-700">
                            Фотографии: {allImages.length}/10
                            {allImages[0] && (
                                <span className="text-green-600 ml-2">
                                    📸 Первая фото — главная
                                </span>
                            )}
                        </p>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {allImages.map((image: any, index: number) => (
                            <div
                                key={index}
                                draggable
                                onDragStart={() => handleDragStart(index)}
                                onDragOver={(e) => handleDragOver(e, index)}
                                onDrop={(e) => handleDrop(e, index)}
                                onClick={() => openLightbox(index)}
                                className={`
                                    relative group rounded-lg border-2 overflow-hidden
                                    ${index === 0 ? 'ring-2 ring-green-500 border-green-500' : 'border-gray-200'}
                                    ${draggedIndex === index ? 'opacity-50' : ''}
                                    transition-all duration-200 cursor-move hover:scale-[1.02] hover:shadow-lg
                                `}
                            >
                                {/* Главная метка */}
                                {index === 0 && (
                                    <div className="absolute top-2 left-2 bg-green-600 text-white text-xs px-2 py-1 rounded z-10">
                                        Главная
                                    </div>
                                )}

                                {/* Иконка удаления (мусорка) */}
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
                                    src={image.previewUrl || image}
                                    alt={`Photo ${index + 1}`}
                                    className="w-full h-40 object-cover"
                                />

                                {/* Индикатор порядка (только при наведении) */}
                                <div className="absolute bottom-2 right-2 bg-black/70 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">
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
                    <div className="mt-3 text-xs text-gray-500 flex flex-col gap-1">
                        <div className="flex items-center gap-1">
                            <span className="text-green-600">📸</span>
                            Первая фотография — главная (отображается в карточке)
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-gray-600">🗑️</span>
                            Наведите на фото и нажмите иконку для удаления
                        </div>
                        <div className="flex items-center gap-1">
                            <span className="text-blue-600">👁️</span>
                            Кликните на фото для просмотра в полном размере
                        </div>
                    </div>
                </div>
            )}

            {/* Загрузка новых фото */}
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
                <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="apartment-images"
                    disabled={isUploading || allImages.length >= 10}
                />
                <label
                    htmlFor="apartment-images"
                    className={`
                        cursor-pointer flex flex-col items-center 
                        ${isUploading || allImages.length >= 10 ? 'opacity-50 cursor-not-allowed' : 'hover:bg-gray-50'} 
                        transition-colors p-4 rounded-lg
                    `}
                >
                    {isUploading ? (
                        <>
                            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
                            <span className="text-sm text-gray-600 mt-2">Загрузка изображений...</span>
                        </>
                    ) : (
                        <>
                            <Upload className="w-8 h-8 text-gray-400" />
                            <div className="mt-2">
                                <p className="text-sm font-medium text-gray-900">
                                    {allImages.length >= 10 ? 'Достигнут лимит 10 фото' : 'Нажмите для загрузки фото'}
                                </p>
                                <p className="text-xs text-gray-500 mt-1">
                                    PNG, JPG, JPEG до 10MB • Максимум 10 фото
                                </p>
                                {allImages.length < 10 && (
                                    <p className="text-xs text-blue-600 mt-2">
                                        Можно загрузить ещё {10 - allImages.length} фото
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </label>
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
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20">
                            ←
                        </div>
                    </button>

                    <button
                        onClick={nextLightboxImage}
                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white hover:text-gray-300 z-10"
                    >
                        <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center hover:bg-white/20">
                            →
                        </div>
                    </button>

                    <div className="relative w-full max-w-4xl max-h-[80vh]">
                        <img
                            src={allImages[lightboxIndex]?.previewUrl || allImages[lightboxIndex]}
                            alt={`Photo ${lightboxIndex + 1}`}
                            className="w-full h-auto max-h-[80vh] object-contain rounded-lg"
                        />

                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-black/70 text-white px-3 py-2 rounded-lg text-sm">
                            Фото {lightboxIndex + 1} из {allImages.length}
                            {lightboxIndex === 0 && (
                                <span className="ml-2 text-green-400">★ Главное фото</span>
                            )}
                        </div>
                    </div>

                    {/* Миниатюры внизу */}
                    <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 overflow-x-auto max-w-full">
                        {allImages.map((image: any, index: number) => (
                            <button
                                key={index}
                                onClick={() => setLightboxIndex(index)}
                                className={`shrink-0 w-16 h-16 rounded overflow-hidden border-2 ${index === lightboxIndex ? 'border-blue-500' : 'border-transparent'}`}
                            >
                                <img
                                    src={image.previewUrl || image}
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
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        price: '',
        type: 'APARTMENT' as 'APARTMENT' | 'HOUSE' | 'STUDIO',
        district: '',
        address: '',
        lat: null as number | null,
        lng: null as number | null,
        rooms: '',
        area: '',
        floor: '',
        amenities: [] as string[],
        // images: [] as File[], // Убрали из formData
    });

    // Новое состояние для всех изображений
    const [allImages, setAllImages] = useState<ImageItem[]>([]);

    useEffect(() => {
        // Очищаем ObjectURL при размонтировании компонента
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
                price: editingApartment.price ? String(editingApartment.price || '').replace('₽', '').trim() : '', type: (editingApartment.type?.toUpperCase() || 'APARTMENT') as 'APARTMENT' | 'HOUSE' | 'STUDIO',
                district: editingApartment.district || '',
                address: editingApartment.address || '',
                lat: editingApartment.lat || null,
                lng: editingApartment.lng || null,
                rooms: editingApartment.rooms?.toString() || '',
                area: editingApartment.area?.toString() || '',
                floor: editingApartment.floor?.toString() || '',
                amenities: editingApartment.amenities || [],
            });

            // Загружаем существующие изображения
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
        } else {
            // Сброс при создании нового
            setFormData({
                title: '', description: '', price: '', type: 'APARTMENT', district: '', address: '',
                lat: null, lng: null, rooms: '', area: '', floor: '', amenities: [],
            });
            setAllImages([]);
        }
    }, [editingApartment]);

    const handleInputChange = useCallback((field: string) =>
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            setFormData(prev => ({ ...prev, [field]: e.target.value }));
        }, []);

    const handleNumberInputChange = useCallback((field: string) =>
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
            case 1: return !!(formData.title && formData.description && formData.district);
            case 2: return !!(formData.price && formData.address && formData.lat && formData.lng);
            case 3: return allImages.length > 0; // Проверяем allImages вместо formData.images
            default: return false;
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
            if (formData.area) formDataToSend.append('area', formData.area);
            if (formData.floor) formDataToSend.append('floor', formData.floor);

            // Добавляем удобства
            formData.amenities.forEach(amenity => formDataToSend.append('amenities', amenity));

            // Отправляем существующие изображения (сохраняем порядок!)
            const existingImagesUrls = allImages
                .filter((img: ImageItem) => img.isExisting && img.originalUrl)
                .map((img: ImageItem) => img.originalUrl!);

            existingImagesUrls.forEach(url => {
                formDataToSend.append('existingImages', url);
            });

            // Отправляем новые изображения
            const newImageFiles = allImages
                .filter((img: ImageItem) => !img.isExisting && img.file)
                .map((img: ImageItem) => img.file!);

            newImageFiles.forEach(file => {
                formDataToSend.append('images', file);
            });

            // Проверяем, что есть хотя бы одно изображение
            if (existingImagesUrls.length === 0 && newImageFiles.length === 0) {
                alert('❌ Добавьте хотя бы одно изображение');
                setIsUploading(false);
                setLoading(false);
                return;
            }

            const token = localStorage.getItem('auth_token');
            const url = editingApartment ? `/api/apartments/${editingApartment.id}` : '/api/apartments';
            const method = editingApartment ? 'PATCH' : 'POST';

            console.log('Отправка объявления:', {
                url, method,
                editing: !!editingApartment,
                existingImages: existingImagesUrls.length,
                newImages: newImageFiles.length,
                totalImages: allImages.length
            });

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataToSend,
            });

            if (response.ok) {
                const result = await response.json();
                console.log('Успешный ответ:', result);

                // Очищаем ObjectURL для новых изображений
                allImages.forEach((img: ImageItem) => {
                    if (!img.isExisting && img.previewUrl) {
                        URL.revokeObjectURL(img.previewUrl);
                    }
                });

                alert(editingApartment
                    ? '✅ Объявление обновлено и отправлено на повторную модерацию!'
                    : '✅ Объявление отправлено на модерацию!');

                onSuccess();
                onClose();

                // Сброс формы
                setFormData({
                    title: '', description: '', price: '', type: 'APARTMENT', district: '', address: '',
                    lat: null, lng: null, rooms: '', area: '', floor: '', amenities: [],
                });
                setAllImages([]);
                setCurrentStep(1);
            } else {
                try {
                    const errorData = await response.json();
                    console.error('Ошибка сервера:', errorData);
                    alert(`❌ Ошибка: ${errorData.error || 'Неизвестная ошибка'}`);
                } catch (parseError) {
                    console.error('Ошибка парсинга ответа:', parseError);
                    alert('❌ Произошла ошибка при отправке объявления');
                }
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
        if (currentStep < 3 && validateStep(currentStep)) {
            setCurrentStep((currentStep + 1) as WizardStep);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep((currentStep - 1) as WizardStep);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold">
                        {editingApartment ? 'Редактировать жилье' : 'Добавить жилье'}
                    </h2>
                    <div className="flex space-x-2">
                        {[1, 2, 3].map((step) => (
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

                {currentStep === 1 && (<Step1 formData={formData} handleInputChange={handleInputChange} />)}
                {currentStep === 2 && (<Step2 formData={formData} handleInputChange={handleInputChange}
                    handleNumberInputChange={handleNumberInputChange} handleCheckboxChange={handleCheckboxChange}
                    handleAddressSelect={handleAddressSelect} />)}
                {currentStep === 3 && (
                    <Step3
                        allImages={allImages}
                        setAllImages={setAllImages}
                        isUploading={isUploading}
                    />
                )}

                <div className="flex justify-between pt-6 mt-6 border-t">
                    <button type="button" onClick={currentStep === 1 ? onClose : prevStep} disabled={loading}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 disabled:opacity-50">
                        {currentStep === 1 ? 'Отмена' : 'Назад'}
                    </button>
                    {currentStep < 3 ? (
                        <button type="button" onClick={nextStep} disabled={!validateStep(currentStep)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed">
                            Далее
                        </button>
                    ) : (
                        <button type="button" onClick={handleSubmit} disabled={loading || !validateStep(3)}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed">
                            {loading ? 'Отправка...' : (editingApartment ? 'Обновить и отправить на модерацию' : 'Отправить на модерацию')}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
