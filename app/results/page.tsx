// app/results/page.tsx - ИСПРАВЛЕННЫЙ БАГ С ВЫДЕЛЕНИЕМ НА КАРТЕ
'use client';
import { useEffect, useState } from 'react';
import MapComponent from '@/components/MapComponent';
import ApartmentList from '@/components/ApartmentList';
import FilterModal from '@/components/FilterModal';
import Link from 'next/link';
import { apartments } from '@/types/apartment';
import { getSearchCriteria } from '@/lib/search-utils';
import { SearchCriteria } from '@/types/scoring';
import { filterApartments } from '@/lib/filter-apartments';

export default function ResultsPage() {
    const [filteredApartments, setFilteredApartments] = useState(apartments);
    const [searchCriteria, setSearchCriteria] = useState<SearchCriteria | null>(null);
    const [selectedApartmentId, setSelectedApartmentId] = useState<number | null>(null);
    const [highlightedApartmentId, setHighlightedApartmentId] = useState<number | null>(null);
    const [showFilterModal, setShowFilterModal] = useState(false);

    useEffect(() => {
        const criteria = getSearchCriteria();
        setSearchCriteria(criteria);

        if (criteria) {
            const filtered = filterApartments(apartments, criteria);
            setFilteredApartments(filtered);
        } else {
            // Если нет критериев, показываем все
            setFilteredApartments(apartments);
        }
    }, []);

    const handleShowOnMap = (apartmentId: number) => {
        // УБИРАЕМ setTimeout - выделение остается пока пользователь не снимет его вручную
        // Если нажимаем на ту же карточку - снимаем выделение, иначе выделяем новую
        setHighlightedApartmentId(current =>
            current === apartmentId ? null : apartmentId
        );
    };

    const handleFilterApply = (newCriteria: SearchCriteria) => {
        setSearchCriteria(newCriteria);
        const filtered = filterApartments(apartments, newCriteria);
        setFilteredApartments(filtered);
        setShowFilterModal(false);

        // Сохраняем в sessionStorage
        sessionStorage.setItem('searchCriteria', JSON.stringify(newCriteria));
    };

    const handleApartmentSelect = (apartmentId: number) => {
        setSelectedApartmentId(apartmentId);
    };

    // Функция для сброса выделения
    const handleResetHighlight = () => {
        setHighlightedApartmentId(null);
    };

    const selectedTypeText = searchCriteria?.propertyType === 'apartment' ? 'Квартиры' :
        searchCriteria?.propertyType === 'house' ? 'Дома' :
            searchCriteria?.propertyType === 'studio' ? 'Студии' : 'Все варианты';

    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* ХЕДЕР */}
            <header className="bg-primary text-primary-foreground px-3 py-2 sm:px-6 sm:py-4 shadow-sm border-b border-black">
                <div className="container mx-auto flex justify-between items-center">
                    <Link href="/" className="text-left hover:opacity-80 transition-opacity">
                        <h1 className="text-lg sm:text-2xl font-bold">СъёмБронь</h1>
                        <p className="text-xs sm:text-sm text-primary-foreground/80 hidden sm:block">
                            Результаты поиска
                        </p>
                    </Link>

                    <nav className="flex gap-2">
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1.5 rounded-md font-medium transition-colors text-xs min-h-[32px]">
                            Войти
                        </button>
                        <button className="bg-green-600 hover:bg-green-700 text-white px-2 sm:px-3 py-1.5 rounded-md font-medium transition-colors text-xs border border-black min-h-[32px]">
                            Добавить
                        </button>
                    </nav>
                </div>
            </header>

            <main className="flex-1 container mx-auto px-3 sm:px-6 py-6 flex flex-col">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">
                            {filteredApartments.length > 0 ?
                                `Найдено ${filteredApartments.length} вариантов` :
                                'Найдено 0 вариантов'
                            }
                        </h2>
                        <p className="text-gray-600">
                            {selectedTypeText} • Нижний Новгород
                        </p>
                        {highlightedApartmentId && (
                            <div className="flex items-center gap-2 mt-2">
                                <p className="text-sm text-blue-600 font-medium">
                                    💡 Объект выделен на карте
                                </p>
                                <button
                                    onClick={handleResetHighlight}
                                    className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200 transition-colors"
                                >
                                    Сбросить выделение
                                </button>
                            </div>
                        )}
                    </div>

                    {/* КНОПКИ ФИЛЬТР И НОВЫЙ ПОИСК */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowFilterModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md font-medium transition-colors text-xs h-fit min-h-[32px] flex items-center"
                        >
                            Фильтр
                        </button>
                        <Link
                            href="/"
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-md font-medium transition-colors text-xs h-fit min-h-[32px] flex items-center"
                        >
                            Новый поиск
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col xl:flex-row gap-6 flex-grow min-h-0">
                    <div className="w-full xl:w-7/12 h-full">
                        <MapComponent
                            apartments={filteredApartments}
                            onApartmentSelect={handleApartmentSelect}
                            selectedApartmentId={selectedApartmentId}
                            highlightedApartmentId={highlightedApartmentId}
                        />
                    </div>

                    <div className="w-full xl:w-5/12 h-full">
                        <ApartmentList
                            apartments={filteredApartments}
                            selectedApartmentId={selectedApartmentId}
                            highlightedApartmentId={highlightedApartmentId}
                            onApartmentSelect={handleApartmentSelect}
                            onShowOnMap={handleShowOnMap}
                            onResetHighlight={handleResetHighlight}
                        />
                    </div>
                </div>
            </main>

            {/* Модальное окно фильтров */}
            {showFilterModal && (
                <FilterModal
                    searchCriteria={searchCriteria}
                    onApply={handleFilterApply}
                    onClose={() => setShowFilterModal(false)}
                />
            )}

            <footer className="bg-muted/50 border-t border-gray-300 mt-12">
                <div className="container mx-auto p-4 sm:p-6">
                    <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
                        <div className="text-center sm:text-left">
                            <Link href="/" className="hover:opacity-80 transition-opacity">
                                <h3 className="text-base sm:text-lg font-semibold">СъёмБронь</h3>
                                <p className="text-xs sm:text-sm text-muted-foreground">Умный поиск жилья</p>
                            </Link>
                        </div>
                        <div className="text-center sm:text-right">
                            <p className="text-xs sm:text-sm text-muted-foreground">
                                © 2024 Все права защищены
                            </p>
                            <p className="text-xs sm:text-sm text-muted-foreground">
                                Телефон: +7 (999) 123-45-67
                            </p>
                        </div>
                    </div>
                </div>
            </footer>
        </div>
    );
}