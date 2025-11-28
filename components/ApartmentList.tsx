// components/ApartmentList.tsx - ИСПРАВЛЕННЫЙ ДЛЯ РАБОТЫ С ЕДИНЫМ ИНТЕРФЕЙСОМ
'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, MessageCircle, ChevronLeft, ChevronRight, X } from 'lucide-react';
import Image from 'next/image';
import { Apartment } from '@/types/apartment'; // Импортируем единый интерфейс

interface ApartmentListProps {
    apartments: Apartment[];
    selectedApartmentId?: number | null;
    highlightedApartmentId?: number | null;
    onApartmentSelect?: (apartmentId: number) => void;
    onShowOnMap?: (apartmentId: number) => void;
    onResetHighlight?: () => void;
}

const generateSellerReviews = (apartmentId: number) => {
    const seed = apartmentId * 12345;
    const rating = 4 + (seed % 100) / 100;
    const reviewCount = 10 + (seed % 100);

    return {
        rating: Math.round(rating * 10) / 10,
        reviewCount
    };
};

const getPlaceholderImage = (type: string) => {
    const typeLower = type.toLowerCase();
    switch (typeLower) {
        case 'apartment':
            return '/placeholder-apartment.jpg';
        case 'house':
            return '/placeholder-house.jpg';
        case 'studio':
            return '/placeholder-studio.jpg';
        default:
            return '/placeholder-default.jpg';
    }
};

const getTypeDisplayName = (type: string) => {
    const typeLower = type.toLowerCase();
    switch (typeLower) {
        case 'apartment':
            return 'Квартира';
        case 'house':
            return 'Дом';
        case 'studio':
            return 'Студия';
        default:
            return type;
    }
};

// Обновляем функцию для работы с единым интерфейсом Apartment
const ApartmentList = ({
    apartments,
    selectedApartmentId,
    highlightedApartmentId,
    onApartmentSelect,
    onShowOnMap,
    onResetHighlight
}: ApartmentListProps) => {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(6);
    const [isMobile, setIsMobile] = useState(false);

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

    useEffect(() => {
        setCurrentPage(1);
    }, [apartments.length]);

    const handleCall = useCallback((apartment: Apartment, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        // Используем заглушку для телефона, так как в интерфейсе нет host.phone
        alert(`Позвонить по номеру: +7 (999) 123-45-67\nКвартира: ${apartment.title}\nАдрес: ${apartment.address}`);
    }, []);

    const handleDetails = useCallback((apartment: Apartment, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(`/apartment/${apartment.id}`);
    }, [router]);

    const handleCardClick = useCallback((apartment: Apartment) => {
        router.push(`/apartment/${apartment.id}`);
    }, [router]);

    const handleShowOnMap = useCallback((apartmentId: number, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (onShowOnMap) {
            onShowOnMap(apartmentId);
        }
    }, [onShowOnMap]);

    // Пагинация
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentApartments = apartments.slice(indexOfFirstItem, indexOfLastItem);
    const totalPages = Math.ceil(apartments.length / itemsPerPage);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);
    const nextPage = () => currentPage < totalPages && setCurrentPage(currentPage + 1);
    const prevPage = () => currentPage > 1 && setCurrentPage(currentPage - 1);

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
        <div className="border-2 border-black rounded-lg p-2 sm:p-4 bg-white h-full flex flex-col">
            <div className="flex justify-between items-center mb-3 sm:mb-6 flex-shrink-0">
                <div className="flex-1">
                    <h3 className="text-base sm:text-xl font-bold">Найдено вариантов</h3>
                    <p className="text-xs text-gray-600">
                        {apartments.length} объектов • Страница {currentPage} из {totalPages}
                    </p>
                </div>
                {highlightedApartmentId && onResetHighlight && (
                    <button
                        onClick={onResetHighlight}
                        className="flex items-center gap-1 text-xs bg-blue-100 text-blue-700 hover:bg-blue-200 px-2 py-1 rounded-full transition-colors ml-2"
                    >
                        <X className="w-3 h-3" />
                        Сбросить
                    </button>
                )}
            </div>

            <div className="flex-grow mb-3 sm:mb-6 min-h-0 overflow-auto">
                <div className="grid grid-cols-2 gap-2 sm:gap-4 h-full auto-rows-fr">
                    {currentApartments.map((apartment) => {
                        const isSelected = selectedApartmentId === apartment.id;
                        const isHighlighted = highlightedApartmentId === apartment.id;
                        const sellerReviews = generateSellerReviews(apartment.id);
                        // Используем photos вместо images
                        const mainPhoto = apartment.photos && apartment.photos.length > 0
                            ? apartment.photos[0]
                            : getPlaceholderImage(apartment.type);
                        const displayType = getTypeDisplayName(apartment.type);

                        return (
                            <div
                                id={`apartment-${apartment.id}`}
                                key={apartment.id}
                                className={`
                                    border-2 rounded-lg bg-white shadow-sm hover:shadow-md transition-all duration-200 
                                    flex flex-col overflow-hidden cursor-pointer min-h-[280px] h-full
                                    ${isSelected ? 'border-green-500 bg-green-50 shadow-md' :
                                        isHighlighted ? 'border-blue-500 bg-blue-50 ring-2 ring-blue-300' :
                                            'border-gray-300 hover:border-gray-400'}
                                `}
                                onClick={() => handleCardClick(apartment)}
                            >
                                {/* ФОТОГРАФИЯ С ФИКСИРОВАННЫМ РАЗМЕРОМ */}
                                <div className="relative aspect-[4/3] overflow-hidden bg-gray-200">
                                    {apartment.photos && apartment.photos.length > 0 ? (
                                        <img
                                            src={mainPhoto}
                                            alt={apartment.title}
                                            className="object-cover hover:scale-105 transition-transform duration-300 w-full h-full"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50">
                                            <div className="text-center">
                                                <div className="text-3xl mb-2">
                                                    {apartment.type === 'apartment' ? '🏢' :
                                                        apartment.type === 'house' ? '🏠' : '📐'}
                                                </div>
                                                <p className="text-gray-500 text-sm">Нет фото</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="absolute top-2 left-2">
                                        <span className={`
                                            px-2 py-1 rounded-full text-xs font-bold text-white
                                            ${apartment.type === 'apartment' ? 'bg-blue-500' :
                                                apartment.type === 'house' ? 'bg-green-500' : 'bg-purple-500'}
                                        `}>
                                            {displayType}
                                        </span>
                                    </div>

                                    {isHighlighted && (
                                        <div className="absolute bottom-2 left-2">
                                            <span className="px-2 py-1 bg-blue-500 text-white rounded-full text-xs font-bold flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                На карте
                                            </span>
                                        </div>
                                    )}
                                </div>

                                <div className="flex-1 p-3 flex flex-col justify-between">
                                    <h4 className="font-bold text-gray-900 text-sm leading-tight line-clamp-2 mb-2">
                                        {apartment.title}
                                    </h4>

                                    <div className="flex justify-between items-center mb-2">
                                        <div className="flex-1">
                                            <span className="font-bold text-green-600 text-lg">
                                                {apartment.price}
                                            </span>
                                            <span className="text-gray-500 text-xs ml-1">/ сутки</span>
                                        </div>

                                        <div className="flex items-center gap-1 bg-yellow-50 px-2 py-1 rounded-full">
                                            <MessageCircle className="w-3 h-3 text-yellow-600" />
                                            <span className="text-xs font-bold text-yellow-700">
                                                {sellerReviews.rating}
                                            </span>
                                            <span className="text-xs text-yellow-600 hidden sm:inline">
                                                ({sellerReviews.reviewCount})
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center">
                                        <div className="flex items-center gap-1 flex-1 min-w-0">
                                            <MapPin className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                            <p className="text-xs text-gray-600 truncate" title={apartment.address}>
                                                {apartment.district}
                                            </p>
                                        </div>

                                        {/* КНОПКА КАРТЫ С ОТСТУПОМ СВЕРХУ НА ДЕСКТОПЕ */}
                                        <button
                                            onClick={(e) => handleShowOnMap(apartment.id, e)}
                                            className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ml-2 flex-shrink-0 sm:mt-1
                                                ${isHighlighted
                                                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                                                    : 'bg-purple-600 hover:bg-purple-700 text-white'}`}
                                            title={isHighlighted ? "Снять выделение с карты" : "Показать на карте"}
                                        >
                                            <MapPin className="w-3 h-3" />
                                            <span className="hidden xs:inline">
                                                {isHighlighted ? "На карте" : "Карта"}
                                            </span>
                                        </button>
                                    </div>

                                    <div className="hidden sm:flex flex-wrap gap-1 mt-2">
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
                            </div>
                        );
                    })}
                </div>
            </div>

            <div className="flex-shrink-0">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-2">
                    <div className="text-xs text-gray-600 order-2 sm:order-1 text-center">
                        {indexOfFirstItem + 1}-{Math.min(indexOfLastItem, apartments.length)} из {apartments.length}
                    </div>

                    <div className="flex items-center gap-1 order-1 sm:order-2 w-full justify-center sm:w-auto">
                        <button
                            onClick={prevPage}
                            disabled={currentPage === 1}
                            className={`p-2 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center ${currentPage === 1
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                        >
                            <ChevronLeft className="w-4 h-4" />
                        </button>

                        <div className="hidden sm:flex items-center gap-1 mx-2">
                            {renderPageNumbers()}
                        </div>

                        <div className="sm:hidden flex items-center mx-2">
                            <span className="text-sm font-medium px-2">
                                {currentPage} / {totalPages}
                            </span>
                        </div>

                        <button
                            onClick={nextPage}
                            disabled={currentPage === totalPages}
                            className={`p-2 rounded-lg transition-colors min-h-[36px] min-w-[36px] flex items-center justify-center ${currentPage === totalPages
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                        >
                            <ChevronRight className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ApartmentList;