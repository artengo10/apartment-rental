'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import Header from '@/components/Header';
import ApartmentList from '@/components/ApartmentList';
import { Apartment } from '@/types/apartment';
import AddApartmentWizard from '@/components/modals/AddApartmentWizard';
import {
    Clock,
    CheckCircle,
    XCircle,
    Edit,
    Eye,
    EyeOff,
    Filter,
    X,
    Eye as ShowEye
} from 'lucide-react';
import Link from 'next/link';

// Расширяем тип для статуса
interface ExtendedApartment extends Apartment {
    status?: string;
    isPublished?: boolean;
    createdAt?: string;
    publishedAt?: string;
    isEdited?: boolean;
}

export default function MyApartmentsPage() {
    const { user } = useAuth();
    const [apartments, setApartments] = useState<ExtendedApartment[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingApartment, setEditingApartment] = useState<any>(null);
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);
    const [filter, setFilter] = useState<'all' | 'published' | 'pending' | 'rejected'>('all');
    const [hiddenApartments, setHiddenApartments] = useState<number[]>([]);
    const [showHiddenCounter, setShowHiddenCounter] = useState(false);

    // Загрузка скрытых объявлений из localStorage
    // ЗАМЕНИТЕ эти две функции в useEffect:
    useEffect(() => {
        const savedHidden = localStorage.getItem('hidden_apartments');
        if (savedHidden) {
            try {
                const parsed = JSON.parse(savedHidden);
                // Проверяем, что это массив чисел
                if (Array.isArray(parsed) && parsed.every(id => typeof id === 'number')) {
                    setHiddenApartments(parsed);
                }
            } catch (error) {
                console.error('Error parsing hidden apartments:', error);
                localStorage.removeItem('hidden_apartments'); // Очищаем поврежденные данные
            }
        }
    }, []);

    useEffect(() => {
        if (hiddenApartments.length > 0) {
            localStorage.setItem('hidden_apartments', JSON.stringify(hiddenApartments));
        } else {
            localStorage.removeItem('hidden_apartments'); // Очищаем если пусто
        }
    }, [hiddenApartments]);

    useEffect(() => {
        if (user) {
            fetchMyApartments();
        }
    }, [user]);

    const fetchMyApartments = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('auth_token');
            const response = await fetch(`/api/apartments/host/${user?.id}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                setApartments(data);
            } else if (response.status === 401) {
                alert("Необходима авторизация");
            }
        } catch (error) {
            console.error('Error fetching my apartments:', error);
        } finally {
            setLoading(false);
        }
    };

    // Функция скрытия объявления
    const handleHideApartment = (apartmentId: number) => {
        if (confirm('Скрыть это объявление из списка?')) {
            setHiddenApartments(prev => [...prev, apartmentId]);
        }
    };

    // Функция показа всех скрытых объявлений
    const showAllHiddenApartments = () => {
        setHiddenApartments([]);
        setShowHiddenCounter(false);
    };

    // Функция показа конкретного скрытого объявления
    const showHiddenApartment = (apartmentId: number) => {
        setHiddenApartments(prev => prev.filter(id => id !== apartmentId));
    };

    // Фильтрация объявлений
    const filteredApartments = apartments
        .filter(apartment => {
            if (filter === 'all') return true;
            if (filter === 'published') return apartment.status === 'APPROVED' && apartment.isPublished;
            if (filter === 'pending') return apartment.status === 'PENDING';
            if (filter === 'rejected') return apartment.status === 'REJECTED';
            return true;
        })
        .filter(apartment => !hiddenApartments.includes(apartment.id));

    // Статистика
    const stats = {
        total: apartments.length,
        published: apartments.filter(a => a.status === 'APPROVED' && a.isPublished).length,
        pending: apartments.filter(a => a.status === 'PENDING').length,
        rejected: apartments.filter(a => a.status === 'REJECTED').length,
        hidden: hiddenApartments.length,
        visible: apartments.length - hiddenApartments.length
    };

    const getStatusBadge = (apartment: ExtendedApartment) => {
        if (apartment.status === 'APPROVED' && apartment.isPublished) {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    <CheckCircle className="w-3 h-3 mr-1" />
                    Опубликовано
                    {apartment.isEdited && (
                        <span className="ml-1 text-purple-600">✏️</span>
                    )}
                </span>
            );
        }

        if (apartment.status === 'PENDING') {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    <Clock className="w-3 h-3 mr-1" />
                    На модерации
                </span>
            );
        }

        if (apartment.status === 'REJECTED') {
            return (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                    <XCircle className="w-3 h-3 mr-1" />
                    Отклонено
                </span>
            );
        }

        return null;
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50">
                <Header />
                <div className="pt-16 flex items-center justify-center min-h-[80vh]">
                    <div className="text-center">
                        <h2 className="text-xl font-semibold mb-4">Необходима авторизация</h2>
                        <p className="text-gray-600">Войдите в систему, чтобы видеть свои объявления</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <Header />

            <div className="pt-2">
                <div className="container mx-auto px-4 py-8">
                    {/* Заголовок и статистика */}
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">Мои объявления</h1>
                        <p className="text-gray-600 mb-6 hidden sm:block">Управляйте своими объявлениями на аренду жилья</p>

                        {/* Статистика */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                            <div className="bg-white rounded-lg p-3 shadow-sm border">
                                <div className="text-xl sm:text-2xl font-bold text-gray-900">{stats.visible}</div>
                                <div className="text-xs sm:text-sm text-gray-600">Видимые</div>
                            </div>
                            <div className="bg-white rounded-lg p-3 shadow-sm border">
                                <div className="text-xl sm:text-2xl font-bold text-green-600">{stats.published}</div>
                                <div className="text-xs sm:text-sm text-gray-600">Опубликовано</div>
                            </div>
                            <div className="bg-white rounded-lg p-3 shadow-sm border">
                                <div className="text-xl sm:text-2xl font-bold text-yellow-600">{stats.pending}</div>
                                <div className="text-xs sm:text-sm text-gray-600">На модерации</div>
                            </div>
                            <div className="bg-white rounded-lg p-3 shadow-sm border">
                                <div className="text-xl sm:text-2xl font-bold text-red-600">{stats.rejected}</div>
                                <div className="text-xs sm:text-sm text-gray-600">Отклонено</div>
                            </div>
                        </div>

                        {/* Счетчик скрытых объявлений */}
                        {stats.hidden > 0 && (
                            <div className="mb-4 p-3 sm:p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                                    <div className="flex items-center gap-2 sm:gap-3">
                                        <EyeOff className="w-4 h-4 sm:w-5 sm:h-5 text-yellow-600 flex-shrink-0" />
                                        <div>
                                            <p className="font-medium text-yellow-800 text-sm sm:text-base">
                                                Скрыто объявлений: {stats.hidden}
                                            </p>
                                            <p className="text-xs sm:text-sm text-yellow-600 hidden sm:block">
                                                Эти объявления не отображаются в списке
                                            </p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={showAllHiddenApartments}
                                        className="px-3 py-1.5 sm:px-4 sm:py-2 bg-yellow-600 text-white rounded-lg hover:bg-yellow-700 transition-colors text-xs sm:text-sm font-medium w-full sm:w-auto"
                                    >
                                        Показать все
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Фильтры */}
                    <div className="bg-white rounded-lg p-3 sm:p-4 shadow-sm border mb-6">
                        <div className="flex flex-wrap gap-2 items-center">
                            <div className="flex items-center mr-2 sm:mr-4 w-full sm:w-auto mb-2 sm:mb-0">
                                <Filter className="w-3 h-3 sm:w-4 sm:h-4 text-gray-500 mr-1 sm:mr-2 flex-shrink-0" />
                                <span className="text-xs sm:text-sm font-medium">Фильтр:</span>
                            </div>

                            <div className="grid grid-cols-2 sm:flex gap-1.5 sm:gap-2 w-full sm:w-auto">
                                <button
                                    onClick={() => setFilter('all')}
                                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium ${filter === 'all' ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    Все ({stats.visible})
                                </button>

                                <button
                                    onClick={() => setFilter('published')}
                                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium ${filter === 'published' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    Опублик. ({stats.published})
                                </button>

                                <button
                                    onClick={() => setFilter('pending')}
                                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium ${filter === 'pending' ? 'bg-yellow-100 text-yellow-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    Модерация ({stats.pending})
                                </button>

                                <button
                                    onClick={() => setFilter('rejected')}
                                    className={`px-3 py-1.5 sm:px-4 sm:py-2 rounded-md text-xs sm:text-sm font-medium ${filter === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
                                >
                                    Отклон. ({stats.rejected})
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Список объявлений */}
                    <div className="bg-white rounded-lg shadow-sm border">
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="animate-spin rounded-full h-10 w-10 sm:h-12 sm:w-12 border-b-2 border-blue-600 mx-auto"></div>
                                <p className="text-gray-500 mt-3 text-sm sm:text-base">Загрузка объявлений...</p>
                            </div>
                        ) : filteredApartments.length === 0 ? (
                            <div className="text-center py-8 sm:py-12">
                                <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🏠</div>
                                <h3 className="text-base sm:text-lg font-semibold mb-2">Объявления не найдены</h3>
                                <p className="text-gray-600 mb-3 sm:mb-4 text-sm sm:text-base">
                                    {filter === 'all'
                                        ? stats.hidden > 0
                                            ? 'Все объявления скрыты. Нажмите "Показать все" выше.'
                                            : 'У вас еще нет объявлений'
                                        : `Нет объявлений с фильтром "${filter}"`}
                                </p>
                                {filter !== 'all' && (
                                    <button
                                        onClick={() => setFilter('all')}
                                        className="text-blue-600 hover:text-blue-800 font-medium text-sm sm:text-base"
                                    >
                                        Показать все объявления
                                    </button>
                                )}
                                {stats.hidden > 0 && (
                                    <button
                                        onClick={showAllHiddenApartments}
                                        className="block mx-auto mt-3 sm:mt-4 px-3 py-1.5 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-xs sm:text-sm"
                                    >
                                        Показать скрытые объявления
                                    </button>
                                )}
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-200">
                                {filteredApartments.map((apartment) => {
                                    // Функция для сокращения адреса
                                    const getShortAddress = (address: string) => {
                                        if (!address) return '';
                                        if (address.length <= 25) return address;
                                        return address.substring(0, 25) + '...';
                                    };

                                    // Функция для сокращения описания
                                    const getShortDescription = (description: string) => {
                                        if (!description) return '';
                                        if (description.length <= 80) return description;
                                        return description.substring(0, 80) + '...';
                                    };

                                    return (
                                        <Link
                                            href={`/apartment/${apartment.id}`}
                                            key={apartment.id}
                                            className="block p-4 sm:p-6 hover:bg-gray-50 transition-colors relative group"
                                        >
                                            {/* Крестик для скрытия - ВИДЕН ВСЕГДА */}
                                            <button
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleHideApartment(apartment.id);
                                                }}
                                                className="absolute top-3 right-3 sm:top-6 sm:right-6 transition-all duration-200 text-gray-400 hover:text-gray-600 hover:bg-white p-1 rounded-full z-10"
                                                title="Скрыть объявление"
                                            >
                                                <X className="w-4 h-4 sm:w-5 sm:h-5" />
                                            </button>

                                            <div className="flex flex-col lg:flex-row lg:items-center gap-3 sm:gap-4">
                                                {/* Информация об объявлении */}
                                                <div className="flex-1">
                                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between mb-2">
                                                        <div className="flex-1">
                                                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 mb-1 line-clamp-1">
                                                                {apartment.title}
                                                            </h3>
                                                            <p className="text-xs sm:text-sm text-gray-600 mb-2">
                                                                {getShortAddress(apartment.address)}
                                                            </p>
                                                        </div>
                                                        <div className="mb-2 sm:mb-0 sm:ml-4">
                                                            {getStatusBadge(apartment)}
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                                                        <div className="text-base sm:text-lg font-bold text-green-600">
                                                            {apartment.price}
                                                        </div>

                                                        <div className="flex items-center text-xs sm:text-sm text-gray-500 gap-2">
                                                            {apartment.area && (
                                                                <span className="flex items-center gap-1">
                                                                    <span className="hidden sm:inline">📏</span>
                                                                    <span>{apartment.area} м²</span>
                                                                </span>
                                                            )}
                                                            {apartment.rooms && (
                                                                <span className="flex items-center gap-1">
                                                                    <span className="hidden sm:inline">🛏️</span>
                                                                    <span>{apartment.rooms} комн.</span>
                                                                </span>
                                                            )}
                                                            <span className="hidden sm:inline">
                                                                🏢 {apartment.type === 'apartment' ? 'Квартира' :
                                                                    apartment.type === 'house' ? 'Дом' : 'Студия'}
                                                            </span>
                                                        </div>
                                                    </div>

                                                    <p className="text-gray-700 text-sm sm:text-base mb-3 line-clamp-2">
                                                        {getShortDescription(apartment.description || '')}
                                                    </p>

                                                    {/* Даты и мета-информация */}
                                                    <div className="flex flex-wrap items-center gap-2 sm:gap-3 text-xs sm:text-sm text-gray-500">
                                                        <div className="flex items-center">
                                                            <Clock className="w-3 h-3 mr-1 hidden sm:block" />
                                                            <span>Создано: {new Date(apartment.createdAt!).toLocaleDateString('ru-RU')}</span>
                                                        </div>

                                                        {apartment.publishedAt && (
                                                            <div className="flex items-center">
                                                                <Eye className="w-3 h-3 mr-1 hidden sm:block" />
                                                                <span>Опубликовано: {new Date(apartment.publishedAt).toLocaleDateString('ru-RU')}</span>
                                                            </div>
                                                        )}

                                                        {apartment.isEdited && (
                                                            <div className="flex items-center text-purple-600">
                                                                <Edit className="w-3 h-3 mr-1 hidden sm:block" />
                                                                <span>Отредактировано</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>

                                                {/* Кнопки действий (только для десктопа) */}
                                                <div className="hidden lg:flex flex-col gap-2 lg:w-48">
                                                    {apartment.status === 'APPROVED' && apartment.isPublished && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                setEditingApartment(apartment);
                                                                setIsEditModalOpen(true);
                                                            }}
                                                            className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors text-center text-sm font-medium flex items-center justify-center gap-2"
                                                        >
                                                            <Edit className="w-4 h-4" />
                                                            Редактировать
                                                        </button>
                                                    )}

                                                    {apartment.status === 'PENDING' && (
                                                        <div className="px-4 py-2 bg-gray-400 text-white rounded-md text-center text-sm font-medium cursor-not-allowed">
                                                            ⏳ На модерации
                                                        </div>
                                                    )}

                                                    {apartment.status === 'REJECTED' && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                alert('Причина отказа: Требуется больше фотографий');
                                                            }}
                                                            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-center text-sm font-medium"
                                                        >
                                                            ❌ Причина
                                                        </button>
                                                    )}
                                                </div>

                                                {/* Мобильные кнопки действий */}
                                                <div className="lg:hidden flex flex-wrap gap-2 mt-2 pt-3 border-t border-gray-200">
                                                    {apartment.status === 'APPROVED' && apartment.isPublished && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                setEditingApartment(apartment);
                                                                setIsEditModalOpen(true);
                                                            }}
                                                            className="flex-1 px-3 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 transition-colors text-xs font-medium flex items-center justify-center gap-1"
                                                        >
                                                            <Edit className="w-3 h-3" />
                                                            Редакт.
                                                        </button>
                                                    )}

                                                    {apartment.status === 'PENDING' && (
                                                        <div className="flex-1 px-3 py-2 bg-gray-400 text-white rounded-md text-xs font-medium text-center">
                                                            ⏳ Модерация
                                                        </div>
                                                    )}

                                                    {apartment.status === 'REJECTED' && (
                                                        <button
                                                            onClick={(e) => {
                                                                e.preventDefault();
                                                                e.stopPropagation();
                                                                alert('Причина отказа: Требуется больше фотографий');
                                                            }}
                                                            className="flex-1 px-3 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors text-xs font-medium"
                                                        >
                                                            ❌ Причина
                                                        </button>
                                                    )}
                                                </div>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Блок для показа скрытых объявлений */}
                    {hiddenApartments.length > 0 && showHiddenCounter && (
                        <div className="mt-6 p-4 bg-gray-100 rounded-lg border">
                            <div className="flex items-center justify-between mb-3">
                                <h4 className="font-medium text-gray-800">Скрытые объявления ({hiddenApartments.length})</h4>
                                <button
                                    onClick={() => setShowHiddenCounter(false)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="space-y-2">
                                {apartments
                                    .filter(apt => hiddenApartments.includes(apt.id))
                                    .map(apartment => (
                                        <div key={apartment.id} className="flex items-center justify-between p-3 bg-white rounded border">
                                            <div>
                                                <span className="font-medium">{apartment.title}</span>
                                                <span className="text-sm text-gray-500 ml-2">
                                                    ({apartment.address})
                                                </span>
                                            </div>
                                            <button
                                                onClick={() => showHiddenApartment(apartment.id)}
                                                className="px-3 py-1 bg-green-100 text-green-700 rounded text-sm hover:bg-green-200"
                                            >
                                                Показать
                                            </button>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Модальное окно редактирования */}
                {isEditModalOpen && editingApartment && (
                    <AddApartmentWizard
                        isOpen={isEditModalOpen}
                        onClose={() => {
                            setIsEditModalOpen(false);
                            setEditingApartment(null);
                        }}
                        onSuccess={() => {
                            fetchMyApartments(); // Обновляем список
                            setIsEditModalOpen(false);
                            setEditingApartment(null);
                        }}
                        editingApartment={editingApartment}
                    />
                )}
            </div>
        </div>
    );
}