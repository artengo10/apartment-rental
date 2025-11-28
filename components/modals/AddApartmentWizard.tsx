'use client';

import { useState, useCallback, memo } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Upload, X, Image as ImageIcon, Loader2 } from 'lucide-react';

interface AddApartmentWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type WizardStep = 1 | 2 | 3;

// Мемоизированные компоненты шагов
const Step1 = memo(({ formData, handleInputChange }: any) => (
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
));

const Step2 = memo(({ formData, handleInputChange, handleNumberInputChange, handleCheckboxChange }: any) => {
    const amenitiesList = ['WiFi', 'TV', 'Kitchen', 'Air conditioning', 'Heating', 'Washing machine', 'Parking'];

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

            <div className="grid grid-cols-3 gap-4">
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
            </div>

            <div>
                <label className="block text-sm font-medium mb-1">Адрес *</label>
                <input
                    type="text"
                    required
                    value={formData.address}
                    onChange={handleInputChange('address')}
                    className="w-full p-2 border rounded"
                    placeholder="ул. Примерная, д. 1, кв. 5"
                />
            </div>

            <div>
                <label className="block text-sm font-medium mb-2">Удобства</label>
                <div className="grid grid-cols-2 gap-2">
                    {amenitiesList.map(amenity => (
                        <label key={amenity} className="flex items-center space-x-2">
                            <input
                                type="checkbox"
                                checked={formData.amenities.includes(amenity)}
                                onChange={handleCheckboxChange(amenity)}
                                className="rounded"
                            />
                            <span className="text-sm">{amenity}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
});

const Step3 = memo(({ formData, setFormData, isUploading }: any) => (
    <div className="space-y-4">
        <h3 className="text-lg font-semibold">Фотографии</h3>
        <p className="text-sm text-gray-600">Загрузите фотографии вашего жилья. Они автоматически загрузятся на imgBB</p>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    const newFiles = [...formData.images, ...files].slice(0, 10); // Ограничение 10 файлов
                    setFormData((prev: any) => ({ ...prev, images: newFiles }));
                }}
                className="hidden"
                id="apartment-images"
                disabled={isUploading}
            />
            <label
                htmlFor="apartment-images"
                className={`cursor-pointer flex flex-col items-center ${isUploading ? 'opacity-50' : 'hover:bg-gray-50'} transition-colors p-4 rounded-lg`}
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
                                Нажмите для загрузки фото
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                                PNG, JPG, JPEG до 10MB
                            </p>
                            <p className="text-xs text-gray-500">
                                Максимум 10 фото
                            </p>
                        </div>
                    </>
                )}
            </label>
        </div>

        {formData.images.length > 0 && (
            <div>
                <p className="text-sm text-gray-600 mb-2">
                    Загружено фото: {formData.images.length}/10
                </p>
                <div className="grid grid-cols-3 gap-2">
                    {formData.images.map((file: File, index: number) => (
                        <div key={index} className="relative group">
                            <img
                                src={URL.createObjectURL(file)}
                                alt={`Preview ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border"
                            />
                            <button
                                type="button"
                                onClick={() => {
                                    const newImages = formData.images.filter((_: File, i: number) => i !== index);
                                    setFormData((prev: any) => ({ ...prev, images: newImages }));
                                }}
                                disabled={isUploading}
                                className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-30"
                            >
                                <X className="w-3 h-3" />
                            </button>
                        </div>
                    ))}
                </div>
            </div>
        )}

        {/* Информация о загрузке */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-sm text-blue-800 flex items-center gap-2">
                <ImageIcon className="w-4 h-4" />
                Изображения автоматически загружаются на imgBB и прикрепляются к объявлению
            </p>
        </div>
    </div>
));

export default function AddApartmentWizard({ isOpen, onClose, onSuccess }: AddApartmentWizardProps) {
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
        rooms: '',
        area: '',
        floor: '',
        amenities: [] as string[],
        images: [] as File[],
    });

    // useCallback для стабильных ссылок на функции
    const handleInputChange = useCallback((field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setFormData(prev => ({
            ...prev,
            [field]: e.target.value
        }));
    }, []);

    const handleNumberInputChange = useCallback((field: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            [field]: value === '' ? '' : value
        }));
    }, []);

    const handleCheckboxChange = useCallback((amenity: string) => (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData(prev => ({
            ...prev,
            amenities: e.target.checked
                ? [...prev.amenities, amenity]
                : prev.amenities.filter(a => a !== amenity)
        }));
    }, []);

    const validateStep = (step: WizardStep): boolean => {
        switch (step) {
            case 1:
                return !!(formData.title && formData.description && formData.district);
            case 2:
                return !!(formData.price && formData.address);
            case 3:
                return formData.images.length > 0;
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

            // Добавляем все поля формы
            formDataToSend.append('title', formData.title);
            formDataToSend.append('description', formData.description);
            formDataToSend.append('price', formData.price);
            formDataToSend.append('type', formData.type);
            formDataToSend.append('district', formData.district);
            formDataToSend.append('address', formData.address);

            if (formData.rooms) formDataToSend.append('rooms', formData.rooms);
            if (formData.area) formDataToSend.append('area', formData.area);
            if (formData.floor) formDataToSend.append('floor', formData.floor);

            formData.amenities.forEach(amenity => {
                formDataToSend.append('amenities', amenity);
            });

            // Добавляем изображения
            formData.images.forEach((file: File) => {
                formDataToSend.append('images', file);
            });

            const token = localStorage.getItem('auth_token');

            const response = await fetch('/api/apartments', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formDataToSend,
            });

            if (response.ok) {
                const result = await response.json();
                alert('Объявление отправлено на модерацию! Мы уведомим вас, когда оно будет опубликовано.');
                onSuccess();
                onClose();

                // Сброс формы
                setFormData({
                    title: '',
                    description: '',
                    price: '',
                    type: 'APARTMENT',
                    district: '',
                    address: '',
                    rooms: '',
                    area: '',
                    floor: '',
                    amenities: [],
                    images: [],
                });
                setCurrentStep(1);
            } else {
                const error = await response.json();
                alert(`Ошибка: ${error.error}`);
            }
        } catch (error) {
            console.error('Error adding apartment:', error);
            alert('Произошла ошибка при отправке объявления');
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
                    <h2 className="text-2xl font-bold">Добавить жилье</h2>
                    <div className="flex space-x-2">
                        {[1, 2, 3].map((step) => (
                            <div
                                key={step}
                                className={`w-3 h-3 rounded-full ${step === currentStep ? 'bg-blue-600' : 'bg-gray-300'
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {currentStep === 1 && (
                    <Step1
                        formData={formData}
                        handleInputChange={handleInputChange}
                    />
                )}
                {currentStep === 2 && (
                    <Step2
                        formData={formData}
                        handleInputChange={handleInputChange}
                        handleNumberInputChange={handleNumberInputChange}
                        handleCheckboxChange={handleCheckboxChange}
                    />
                )}
                {currentStep === 3 && (
                    <Step3
                        formData={formData}
                        setFormData={setFormData}
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

                    {currentStep < 3 ? (
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
                            disabled={loading || !validateStep(3)}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Отправка...' : 'Отправить на модерацию'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}
