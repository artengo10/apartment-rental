'use client';
import { Apartment } from '../types/apartment';
import { useState } from 'react';
import Link from 'next/link';

interface ApartmentListProps {
    apartments: Apartment[];
}

const ApartmentList = ({ apartments }: ApartmentListProps) => {
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8; // 8 карточек на странице

    // Вычисляем индексы для текущей страницы
    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const currentApartments = apartments.slice(indexOfFirstItem, indexOfLastItem);

    // Вычисляем общее количество страниц
    const totalPages = Math.ceil(apartments.length / itemsPerPage);

    // Функция для изменения страницы
    const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

    // Функция для следующей страницы
    const nextPage = () => {
        if (currentPage < totalPages) {
            setCurrentPage(currentPage + 1);
        }
    };

    // Функция для предыдущей страницы
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

    const handleBook = (apartment: Apartment, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        alert(`Бронирование квартиры: ${apartment.title}\nЦена: ${apartment.price}`);
    };

    return (
        <div className="border-2 border-black rounded-lg p-4 bg-white h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-bold">Похожие варианты</h3>
                <span className="text-sm text-gray-600 hidden sm:block">
                    Страница {currentPage} из {totalPages}
                </span>
            </div>

            {/* Сетка карточек - адаптивная */}
            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
                {currentApartments.map((apartment, index) => (
                    <Link
                        href={`/apartment/${apartment.id}`}
                        key={apartment.id}
                        className="block"
                    >
                        <div className="border border-gray-300 rounded-lg bg-white shadow-sm hover:shadow-md transition-shadow flex flex-col overflow-hidden cursor-pointer h-full">
                            <div className="p-3 flex-1 min-h-0">
                                <h4 className="font-semibold text-blue-700 text-sm mb-2 leading-tight line-clamp-2">{apartment.title}</h4>
                                <p className="text-xs text-gray-600 mb-2 truncate" title={apartment.address}>{apartment.address}</p>
                                <p className="text-xs text-gray-500 mb-3 line-clamp-2">{apartment.description}</p>
                                <div className="flex items-center justify-between mb-3">
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

                            {/* Кнопки - обернуты для остановки всплытия */}
                            <div className="flex border-t border-gray-200" onClick={(e) => e.stopPropagation()}>
                                <button
                                    onClick={(e) => handleCall(apartment, e)}
                                    className="flex-1 bg-green-600 text-white py-2 text-xs font-medium hover:bg-green-700 transition-colors whitespace-nowrap px-2"
                                >
                                    Позвонить
                                </button>
                                <button
                                    onClick={(e) => handleBook(apartment, e)}
                                    className="flex-1 bg-blue-600 text-white py-2 text-xs font-medium hover:bg-blue-700 transition-colors whitespace-nowrap px-2 border-l border-white border-opacity-50"
                                >
                                    Подробнее
                                </button>

                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Пагинация - адаптивная */}
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
                {/* Информация о количестве */}
                <div className="text-sm text-gray-600 order-3 sm:order-1 text-center sm:text-left">
                    Показано {currentApartments.length} из {apartments.length}
                </div>

                {/* Номера страниц - для мобильных компактнее */}
                <div className="flex flex-wrap justify-center gap-1 order-1 sm:order-2">
                    {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                        let pageNumber;
                        if (totalPages <= 5) {
                            pageNumber = i + 1;
                        } else if (currentPage <= 3) {
                            pageNumber = i + 1;
                        } else if (currentPage >= totalPages - 2) {
                            pageNumber = totalPages - 4 + i;
                        } else {
                            pageNumber = currentPage - 2 + i;
                        }

                        return (
                            <button
                                key={pageNumber}
                                onClick={() => paginate(pageNumber)}
                                className={`w-8 h-8 rounded text-sm ${currentPage === pageNumber
                                    ? 'bg-green-600 text-white'
                                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                                    }`}
                            >
                                {pageNumber}
                            </button>
                        );
                    })}
                    {totalPages > 5 && (
                        <span className="px-2 py-1 text-gray-500">...</span>
                    )}
                </div>

                {/* Кнопки навигации */}
                <div className="flex gap-2 order-2 sm:order-3">
                    <button
                        onClick={prevPage}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded text-sm ${currentPage === 1
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                    >
                        Назад
                    </button>
                    <button
                        onClick={nextPage}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 rounded text-sm ${currentPage === totalPages
                            ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                            : 'bg-blue-600 text-white hover:bg-blue-700'
                            }`}
                    >
                        Вперед
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ApartmentList;