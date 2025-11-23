// app/results/page.tsx - ИСПРАВЛЕННЫЙ БЕЗ onApartmentSelect
'use client';
import { useEffect, useState, useRef } from 'react';
import MapComponent from '@/components/MapComponent';
import ApartmentList from '@/components/ApartmentList';
import FilterModal from '@/components/FilterModal';
import Link from 'next/link';
import { apartments } from '@/types/apartment';
import { getSearchCriteria } from '@/lib/search-utils';
import { SearchCriteria } from '@/types/scoring';
import { filterApartments } from '@/lib/filter-apartments';
import Header from '@/components/Header';

export default function ResultsPage() {
    const [filteredApartments, setFilteredApartments] = useState(apartments);
    const [searchCriteria, setSearchCriteria] = useState<SearchCriteria | null>(null);
    const [selectedApartmentId, setSelectedApartmentId] = useState<number | null>(null);
    const [highlightedApartmentId, setHighlightedApartmentId] = useState<number | null>(null);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const mapContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        const criteria = getSearchCriteria();
        setSearchCriteria(criteria);

        if (criteria) {
            const filtered = filterApartments(apartments, criteria);
            setFilteredApartments(filtered);
        } else {
            setFilteredApartments(apartments);
        }
    }, []);

    const handleShowOnMap = (apartmentId: number) => {
        setHighlightedApartmentId(current =>
            current === apartmentId ? null : apartmentId
        );

        // Скролл к карте на мобилке
        if (isMobile && mapContainerRef.current) {
            setTimeout(() => {
                mapContainerRef.current?.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                });
            }, 100);
        }
    };

    const handleFilterApply = (newCriteria: SearchCriteria) => {
        setSearchCriteria(newCriteria);
        const filtered = filterApartments(apartments, newCriteria);
        setFilteredApartments(filtered);
        setShowFilterModal(false);
        sessionStorage.setItem('searchCriteria', JSON.stringify(newCriteria));
    };

    const handleResetHighlight = () => {
        setHighlightedApartmentId(null);
    };

    const selectedTypeText = searchCriteria?.propertyType === 'apartment' ? 'Квартиры' :
        searchCriteria?.propertyType === 'house' ? 'Дома' :
            searchCriteria?.propertyType === 'studio' ? 'Студии' : 'Все варианты';

    return (
        <div className="min-h-screen flex flex-col bg-background">
            
            <Header />

            <main className="flex-1 container mx-auto px-3 sm:px-6 py-6 flex flex-col">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        {/* УМЕНЬШЕННЫЙ ТЕКСТ ДЛЯ МОБИЛЬНЫХ */}
                        <h2 className="text-lg sm:text-2xl font-bold mb-2 whitespace-nowrap">
                            {filteredApartments.length > 0 ?
                                `Найдено ${filteredApartments.length} вариантов` :
                                'Найдено 0 вариантов'
                            }
                        </h2>
                        <p className="text-gray-600 text-xs sm:text-base">
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
                                    Сбросить
                                </button>
                            </div>
                        )}
                    </div>

                    {/* УМЕНЬШЕННЫЕ КНОПКИ ДЛЯ МОБИЛЬНЫХ */}
                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowFilterModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 sm:px-3 sm:py-1.5 rounded-md font-medium transition-colors text-xs sm:text-xs h-fit min-h-[36px] sm:min-h-[32px] flex items-center whitespace-nowrap"
                        >
                            Фильтр
                        </button>
                        <Link
                            href="/"
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 sm:px-3 sm:py-1.5 rounded-md font-medium transition-colors text-xs sm:text-xs h-fit min-h-[36px] sm:min-h-[32px] flex items-center whitespace-nowrap"
                        >
                            Новый поиск
                        </Link>
                    </div>
                </div>

                <div className="flex flex-col xl:flex-row gap-6 flex-grow min-h-0">
                    <div ref={mapContainerRef} className="w-full xl:w-7/12 h-full">
                        <MapComponent
                            apartments={filteredApartments}
                            selectedApartmentId={selectedApartmentId}
                            highlightedApartmentId={highlightedApartmentId}
                        />
                    </div>

                    <div className="w-full xl:w-5/12 h-full">
                        <ApartmentList
                            apartments={filteredApartments}
                            selectedApartmentId={selectedApartmentId}
                            highlightedApartmentId={highlightedApartmentId}
                            onShowOnMap={handleShowOnMap}
                            onResetHighlight={handleResetHighlight}
                        />
                    </div>
                </div>
            </main>

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