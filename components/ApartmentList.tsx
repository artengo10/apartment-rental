// components/ApartmentList.tsx
'use client';
import { Apartment } from '../types/apartment';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

interface ApartmentListProps {
    apartments: Apartment[];
}

const ApartmentList = ({ apartments }: ApartmentListProps) => {
    const router = useRouter();
    const [currentPage, setCurrentPage] = useState(1);
    const [itemsPerPage, setItemsPerPage] = useState(8);
    const [isMobile, setIsMobile] = useState(false);

    // Адаптивное количество элементов на странице
    useEffect(() => {
        const updateLayout = () => {
            const mobile = window.innerWidth < 768;
            setIsMobile(mobile);

            if (mobile) {
                setItemsPerPage(4); // Мобильные: 2 ряда по 2 карточки = 4
            } else {
                setItemsPerPage(6); // ПК: 3 ряда по 2 колонки = 6
            }
        };

        updateLayout();
        window.addEventListener('resize', updateLayout);
        
        return () => window.removeEventListener('resize', updateLayout);
    }, []);

    // Вычисляем индексы для текущей страницы
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentApartments = apartments.slice(indexOfFirstItem, indexOfLastItem);

    const totalPages = Math.ceil(apartments.length / itemsPerPage);

    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
            setCurrentPage(currentPage - 1);
        }
    };

    const handleCall = (apartment: Apartment, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        alert(`Позвонить по номеру: +7 (999) 123-45-67\nКвартира: ${apartment.title}`);
    };

    const handleDetails = (apartment: Apartment, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        router.push(`/apartment/${apartment.id}`);
    };

    const handleCardClick = (apartmentId: number) => {
        router.push(`/apartment/${apartmentId}`);
    };

    return (
        <div className="border-2 border-black rounded-lg p-3 sm:p-4 bg-white h-full flex flex-col">
            {/* Заголовок */}
            <div className="flex justify-between items-center mb-4 sm:mb-6 flex-shrink-0">
                <h3 className="text-lg sm:text-xl font-bold">Похожие варианты</h3>
                <span className="text-xs sm:text-sm text-gray-600 hidden sm:block">
                    Страница {currentPage} из {totalPages}
                </span>
            </div>

            {/* СЕТКА КАРТОЧЕК - ОСНОВНОЕ ИЗМЕНЕНИЕ */}
            <div className="flex-grow mb-4 sm:mb-6 min-h-0">
                {/* ИЗМЕНЕНИЕ: на всех устройствах 2 колонки */}
                <div className="grid grid-cols-2 gap-2 sm:gap-3 h-full">
                    {currentApartments.map((apartment) => (
                        <div
                            key={apartment.id}
                            className="border border-gray-300 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden cursor-pointer h-full"
                            onClick={() => handleCardClick(apartment.id)}
                        >
                            <div className="p-2 sm:p-3 flex-1 min-h-0 flex flex-col">
                                <h4 className="font-semibold text-blue-700 text-sm mb-1 sm:mb-2 leading-tight line-clamp-2 flex-shrink-0">{apartment.title}</h4>
                                <p className="text-xs text-gray-600 mb-1 sm:mb-2 truncate flex-shrink-0" title={apartment.address}>{apartment.address}</p>
                                <p className="text-xs text-gray-500 mb-2 sm:mb-3 line-clamp-2 flex-grow">{apartment.description}</p>
                                <div className="flex items-center justify-between mb-2 sm:mb-3 flex-shrink-0">
                                    <span className="font-bold text-green-600 text-sm">{apartment.price}</span>
                                    <div className="flex flex-col items-end gap-1">
                                        <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded truncate max-w-[80px]">
                                            {apartment.district}
                                        </span>
                                        <span className="text-xs text-blue-600 bg-blue-100 px-2 py-1 rounded">
                                            {apartment.type === 'apartment' ? 'Квартира' : apartment.type === 'house' ? 'Дом' : 'Студия'}
                                        </span>
                                    </div>
                                </div>
                            </div>

                            {/* Кнопки */}
                            <div className="flex border-t border-gray-200 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={(e) => handleCall(apartment, e)}
                                    className="flex-1 bg-green-600 text-white py-2 text-xs font-medium hover:bg-green-700 transition-colors whitespace-nowrap px-2"
                                >
                                    Позвонить
                                </button>
                                <button
                                    onClick={(e) => handleDetails(apartment, e)}
                                    className="flex-1 bg-blue-600 text-white py-2 text-xs font-medium hover:bg-blue-700 transition-colors whitespace-nowrap px-2 border-l border-white border-opacity-50"
                                >
                                    Подробнее
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Пагинация */}
            <div className="flex-shrink-0">
                <div className="flex flex-col sm:flex-row justify-between items-center gap-3">
                    <div className="text-xs sm:text-sm text-gray-600 order-3 sm:order-1 text-center sm:text-left">
                        Показано {currentApartments.length} из {apartments.length}
                    </div>

                    <div className="flex flex-wrap justify-center gap-1 order-1 sm:order-2">
                        {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                            let pageNumber;
                            if (totalPages <= 7) {
                                pageNumber = i + 1;
                            } else if (currentPage <= 4) {
                                pageNumber = i + 1;
                            } else if (currentPage >= totalPages - 3) {
                                pageNumber = totalPages - 6 + i;
                            } else {
                                pageNumber = currentPage - 3 + i;
                            }

                            return (
                                <button
                                    key={pageNumber}
                                    onClick={() => paginate(pageNumber)}
                                    className={`w-7 h-7 rounded text-xs ${currentPage === pageNumber
                                        ? 'bg-green-600 text-white'
                                        : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                        }`}
                                >
                                    {pageNumber}
                                </button>
                            );
                        })}
                    </div>

                    <div className="flex gap-2 order-2 sm:order-3">
                        <button
                            onClick={prevPage}
                            disabled={currentPage === 1}
                            className={`px-3 py-1 rounded text-xs ${currentPage === 1
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                        >
                            Назад
                        </button>
                        <button
                            onClick={nextPage}
                            disabled={currentPage === totalPages}
                            className={`px-3 py-1 rounded text-xs ${currentPage === totalPages
                                ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                : 'bg-blue-600 text-white hover:bg-blue-700'
                                }`}
                        >
                            Вперед
                        </button>
                    </div>
                </div>

                {isMobile && (
                    <div className="text-center mt-2">
                        <span className="text-xs text-gray-500">
                            Страница {currentPage} из {totalPages}
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ApartmentList;