// components/ApartmentList.tsx - ОБНОВЛЕННАЯ ВЕРСИЯ С ОТЗЫВАМИ ПРОДАВЦА
'use client';
import { ScoredApartment } from '@/types/scoring';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, Phone, Calendar, Star, Home, Building, MessageCircle } from 'lucide-react';

interface ApartmentListProps {
    apartments: ScoredApartment[];
    selectedApartmentId?: number | null;
    onApartmentSelect?: (apartmentId: number) => void;
    onShowOnMap?: (apartmentId: number) => void;
}

// Функция для генерации случайных данных об отзывах на основе ID
const generateSellerReviews = (apartmentId: number) => {
    // Детерминированная генерация на основе ID для постоянства
    const seed = apartmentId * 12345;
    const rating = 4 + (seed % 100) / 100; // Рейтинг от 4.0 до 5.0
    const reviewCount = 10 + (seed % 100); // Количество отзывов от 10 до 110

    return {
        rating: Math.round(rating * 10) / 10, // Округляем до одного знака
        reviewCount
    };
};

const ApartmentList = ({ apartments, selectedApartmentId, onApartmentSelect, onShowOnMap }: ApartmentListProps) => {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6);
    const [isMobile, setIsMobile] = useState(false);
    const [permanentlyHighlighted, setPermanentlyHighlighted] = useState<number | null>(null);

    // Адаптивное количество элементов
    useEffect(() => {
        const updateLayout = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);
            setItemsPerPage(mobile ? 4 : 6);
        };

        updateLayout();
        window.addEventListener('resize', updateLayout);
        return () => window.removeEventListener('resize', updateLayout);
    }, []);

    // Сброс страницы при изменении фильтров
    useEffect(() => {
        setCurrentPage(1);
    }, [apartments.length]);

    // Прокрутка к выбранной карточке
    useEffect(() => {
        if (selectedApartmentId) {
            const selectedElement = document.getElementById(`apartment-${selectedApartmentId}`);
            if (selectedElement) {
                setTimeout(() => {
                    selectedElement.scrollIntoView({
                        behavior: 'smooth',
                        block: 'nearest',
                        inline: 'nearest'
                    });
                }, 100);
            }
        }
    }, [selectedApartmentId]);

    // Обработчики действий
    const handleCall = useCallback((apartment: ScoredApartment, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        alert(`Позвонить по номеру: +7 (999) 123-45-67\nКвартира: ${apartment.title}\nАдрес: ${apartment.address}`);
    }, []);

    const handleDetails = useCallback((apartment: ScoredApartment, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(`/apartment/${apartment.id}`);
    }, [router]);

    const handleShowOnMap = useCallback((apartmentId: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setPermanentlyHighlighted(apartmentId);
        if (onShowOnMap) {
            onShowOnMap(apartmentId);
        }
    }, [onShowOnMap]);

    const handleCardClick = useCallback((apartmentId: number) => {
        if (onApartmentSelect) {
            onApartmentSelect(apartmentId);
        }
    }, [onApartmentSelect]);

    // Пагинация
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentApartments = apartments.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(apartments.length / itemsPerPage);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
    const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
    const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

    // Функция для отображения номеров страниц с эллипсисом
    const renderPageNumbers = () => {
        const pages = [];
        const maxVisiblePages = 7;

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i);
            }
        } else {
            if (currentPage <= 4) {
                for (let i = 1; i <= 5; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            } else if (currentPage >= totalPages - 3) {
                pages.push(1);
                pages.push('...');
                for (let i = totalPages - 4; i <= totalPages; i++) {
                    pages.push(i);
                }
            } else {
                pages.push(1);
                pages.push('...');
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i);
                }
                pages.push('...');
                pages.push(totalPages);
            }
        }

        return pages.map((page, index) => {
            if (page === '...') {
                return (
                    <span key={`ellipsis-${index}`} className="px-2 text-gray-500 text-xs">
                        ...
                    </span>
                );
            }

            return (
                <button
                    key={page}
                    onClick={() => paginate(page as number)}
                    className={`w-7 h-7 rounded text-xs font-medium ${currentPage === page
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                >
                    {page}
                </button>
            );
        });
    };

    if (apartments.length === 0) {
        return (
            <div className="border-2 border-black rounded-lg p-4 sm:p-6 bg-white h-full flex flex-col">
                <div className="flex justify-between items-center mb-4 sm:mb-6 flex-shrink-0">
                    <h3 className="text-lg sm:text-xl font-bold">Похожие варианты</h3>
                </div>
                <div className="flex-grow flex items-center justify-center">
                    <div className="text-center">
                        <div className="text-4xl mb-4">🏠</div>
                        <p className="text-gray-500 mb-2">Нет вариантов, соответствующих вашему запросу</p>
                        <p className="text-sm text-gray-400">Попробуйте изменить параметры поиска</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="border-2 border-black rounded-lg p-3 sm:p-4 bg-white h-full flex flex-col">
            {/* Заголовок */}
            <div className="flex justify-between items-center mb-4 sm:mb-6 flex-shrink-0">
                <div>
                    <h3 className="text-lg sm:text-xl font-bold">Найдено вариантов</h3>
                    <p className="text-sm text-gray-600">
                        {apartments.length} объектов • Страница {currentPage} из {totalPages}
                    </p>
                </div>
                {permanentlyHighlighted && (
                    <button
                        onClick={() => setPermanentlyHighlighted(null)}
                        className="text-xs bg-gray-100 hover:bg-gray-200 px-3 py-1 rounded-full transition-colors"
                    >
                        Сбросить выделение
                    </button>
                )}
            </div>

            {/* Сетка карточек */}
            <div className="flex-grow mb-4 sm:mb-6 min-h-0 overflow-auto">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 h-full auto-rows-fr">
                    {currentApartments.map((apartment) => {
                        const isSelected = selectedApartmentId === apartment.id;
                        const isHighlighted = permanentlyHighlighted === apartment.id;
                        const sellerReviews = generateSellerReviews(apartment.id);

                        return (
                            <div
                                id={`apartment-${apartment.id}`}
                                key={apartment.id}
                                className={`
                                    border-2 rounded-xl bg-white shadow-sm hover:shadow-md transition-all duration-200 
                                    flex flex-col overflow-hidden cursor-pointer min-h-[180px] h-full
                                    ${isSelected ? 'border-green-500 bg-green-50 shadow-md' :
                                        isHighlighted ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-200' :
                                            'border-gray-300 hover:border-gray-400'}
                                `}
                                onClick={() => handleCardClick(apartment.id)}
                            >
                                {/* Заголовок карточки */}
                                <div className="p-3 flex-1 min-h-0 flex flex-col">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex-1 min-w-0">
                                            <h4 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2 pr-2">
                                                {apartment.title}
                                            </h4>
                                            <div className="flex items-center gap-1 mt-1">
                                                {apartment.type === 'apartment' && <Building className="w-3 h-3 text-blue-500" />}
                                                {apartment.type === 'house' && <Home className="w-3 h-3 text-green-500" />}
                                                {apartment.type === 'studio' && <Building className="w-3 h-3 text-purple-500" />}
                                                <span className="text-xs text-gray-500 capitalize">
                                                    {apartment.type === 'apartment' ? 'Квартира' :
                                                        apartment.type === 'house' ? 'Дом' : 'Студия'}
                                                </span>
                                            </div>
                                        </div>

                                        {/* ОТЗЫВЫ ПРОДАВЦА вместо баллов */}
                                        <div className="flex flex-col items-end gap-1 flex-shrink-0">
                                            <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                                                <MessageCircle className="w-3 h-3 text-yellow-600" />
                                                <span className="text-xs font-bold text-yellow-700">
                                                    {sellerReviews.rating}
                                                </span>
                                                <Star className="w-3 h-3 text-yellow-500 fill-yellow-500" />
                                            </div>
                                            <span className="text-xs text-gray-500">
                                                {sellerReviews.reviewCount} отзывов
                                            </span>
                                        </div>
                                    </div>

                                    {/* Адрес */}
                                    <div className="flex items-start gap-1 mb-2">
                                        <MapPin className="w-3 h-3 text-gray-400 mt-0.5 flex-shrink-0" />
                                        <p className="text-xs text-gray-600 line-clamp-2 flex-1" title={apartment.address}>
                                            {apartment.address}
                                        </p>
                                    </div>

                                    {/* Детали */}
                                    <div className="space-y-2 mb-2 flex-grow">
                                        <p className="text-xs text-gray-700 line-clamp-2">
                                            {apartment.description}
                                        </p>

                                        {/* БАЛЛЫ СОВПАДЕНИЯ - перемещены сюда */}
                                        <div className="flex items-center justify-between mt-2">
                                            <span className="text-xs text-gray-600 font-medium">Совпадение с запросом:</span>
                                            <div className={`
                                                px-2 py-1 rounded-full text-xs font-bold
                                                ${apartment.relevanceScore >= 7 ? 'bg-green-100 text-green-800 border border-green-300' :
                                                    apartment.relevanceScore >= 4 ? 'bg-yellow-100 text-yellow-800 border border-yellow-300' :
                                                        'bg-gray-100 text-gray-800 border border-gray-300'}
                                            `}>
                                                {apartment.relevanceScore}/10
                                            </div>
                                        </div>

                                        {/* Дополнительная информация */}
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {apartment.rooms && (
                                                <span className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                                                    {apartment.rooms} комн.
                                                </span>
                                            )}
                                            {apartment.area && (
                                                <span className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                                                    {apartment.area} м²
                                                </span>
                                            )}
                                            {apartment.floor && (
                                                <span className="text-xs bg-gray-100 text-gray-700 px-1.5 py-0.5 rounded">
                                                    {apartment.floor} этаж
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Цена и район */}
                                    <div className="flex items-center justify-between mt-auto pt-2">
                                        <span className="font-bold text-green-600 text-base">{apartment.price}</span>
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-full truncate max-w-[100px]">
                                            {apartment.district}
                                        </span>
                                    </div>
                                </div>

                                {/* Кнопки действий */}
                                <div className="flex border-t border-gray-200" onClick={(e) => e.stopPropagation()}>
                                    <button
                                        onClick={(e) => handleCall(apartment, e)}
                                        className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 px-1 text-xs font-medium transition-colors flex items-center justify-center gap-1 rounded-bl-lg"
                                    >
                                        <Phone className="w-3 h-3" />
                                        <span className="hidden xs:inline">Звонок</span>
                                    </button>
                                    <button
                                        onClick={(e) => handleDetails(apartment, e)}
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-1 text-xs font-medium transition-colors flex items-center justify-center gap-1 border-l border-white border-opacity-50"
                                    >
                                        <Calendar className="w-3 h-3" />
                                        <span className="hidden xs:inline">Подробно</span>
                                    </button>
                                    <button
                                        onClick={(e) => handleShowOnMap(apartment.id, e)}
                                        className={`flex-1 py-2 px-1 text-xs font-medium transition-colors flex items-center justify-center gap-1 border-l border-white border-opacity-50 rounded-br-lg
                                            ${isHighlighted ? 'bg-purple-700 text-white' : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
                                        title={isHighlighted ? "Выделен на карте" : "Показать на карте"}
                                    >
                                        <MapPin className="w-3 h-3" />
                                        <span className="hidden xs:inline">{isHighlighted ? "На карте" : "Карта"}</span>
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Пагинация */}
            <div className="flex-shrink-0">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                    <div className="text-xs text-gray-600 order-2 sm:order-1 text-center">
                        {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, apartments.length)} из {apartments.length}
                    </div>

                    <div className="flex items-center gap-1 order-1 sm:order-2">
                        <button
                            onClick={prevPage}
                            disabled={currentPage === 1}
                            className={`p-1.5 rounded-lg transition-colors ${currentPage === 1
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                        >
                            ←
                        </button>

                        <div className="flex items-center gap-1 flex-wrap justify-center">
                            {renderPageNumbers()}
                        </div>

                        <button
                            onClick={nextPage}
                            disabled={currentPage === totalPages}
                            className={`p-1.5 rounded-lg transition-colors ${currentPage === totalPages
                                    ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                        >
                            →
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApartmentList;