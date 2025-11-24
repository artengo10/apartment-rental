'use client';

import { useState, useCallback, memo } from 'react';
import { useAuth } from '@/context/AuthContext';

interface AddApartmentWizardProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

type WizardStep = 1 | 2 | 3;

// Мемоизированные компоненты шагов для решения проблемы с клавиатурой
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
                />
            </div>

            <div className="grid grid-cols-3 gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">Комнаты</label>
                    <input
                        type="number"
                        value={formData.rooms}
                        onChange={handleNumberInputChange('rooms')}
                        className="w-full p-2 border rounded"
                        placeholder="2"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Площадь (м²)</label>
                    <input
                        type="number"
                        value={formData.area}
                        onChange={handleNumberInputChange('area')}
                        className="w-full p-2 border rounded"
                        placeholder="45"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium mb-1">Этаж</label>
                    <input
                        type="number"
                        value={formData.floor}
                        onChange={handleNumberInputChange('floor')}
                        className="w-full p-2 border rounded"
                        placeholder="3"
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
                            <span>{amenity}</span>
                        </label>
                    ))}
                </div>
            </div>
        </div>
    );
});

const Step3 = memo(({ formData, setFormData }: any) => (
    <div className="space-y-4">
        <h3 className="text-lg font-semibold">Фотографии</h3>
        <p className="text-sm text-gray-600">Загрузите до 10 фотографий вашего жилья</p>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center">
            <input
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => {
                    const files = Array.from(e.target.files || []);
                    setFormData((prev: any) => ({ ...prev, images: [...prev.images, ...files] }));
                }}
                className="hidden"
                id="apartment-images"
            />
            <label htmlFor="apartment-images" className="cursor-pointer">
                <div className="flex flex-col items-center">
                    <span className="text-blue-600 font-medium">Нажмите для загрузки фото</span>
                    <span className="text-sm text-gray-500">или перетащите файлы сюда</span>
                </div>
            </label>
        </div>

        {formData.images.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-4">
                {formData.images.map((file: File, index: number) => (
                    <div key={index} className="relative">
                        <img
                            src={URL.createObjectURL(file)}
                            alt={`Preview ${index + 1}`}
                            className="w-full h-24 object-cover rounded"
                        />
                        <button
                            type="button"
                            onClick={() => {
                                const newImages = [...formData.images];
                                newImages.splice(index, 1);
                                setFormData((prev: any) => ({ ...prev, images: newImages }));
                            }}
                            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center"
                        >
                            ×
                        </button>
                    </div>
                ))}
            </div>
        )}
    </div>
));

export default function AddApartmentWizard({ isOpen, onClose, onSuccess }: AddApartmentWizardProps) {
    const { user } = useAuth();
    const [currentStep, setCurrentStep] = useState<WizardStep>(1);
    const [loading, setLoading] = useState(false);
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
        setFormData(prev => ({
            ...prev,
            [field]: e.target.value
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

    const handleSubmit = async () => {
        if (!user) return;

        setLoading(true);
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

            formData.images.forEach((file: File) => {
                formDataToSend.append('images', file);
            });

            const token = localStorage.getItem('auth_token');
            
            const response = await fetch('/apartment', { // Исправленный URL
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
        }
    };

    const nextStep = () => {
        if (currentStep < 3) setCurrentStep((currentStep + 1) as WizardStep);
    };

    const prevStep = () => {
        if (currentStep > 1) setCurrentStep((currentStep - 1) as WizardStep);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50">
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
                    />
                )}

                <div className="flex justify-between pt-6 mt-6 border-t">
                    <button
                        type="button"
                        onClick={currentStep === 1 ? onClose : prevStep}
                        className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    >
                        {currentStep === 1 ? 'Отмена' : 'Назад'}
                    </button>

                    {currentStep < 3 ? (
                        <button
                            type="button"
                            onClick={nextStep}
                            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                        >
                            Далее
                        </button>
                    ) : (
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading || formData.images.length === 0}
                            className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                        >
                            {loading ? 'Отправка...' : 'Отправить на модерацию'}
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
}