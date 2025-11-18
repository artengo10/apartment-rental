// app/results/page.tsx - ОБНОВЛЕННАЯ ВЕРСИЯ С УМЕНЬШЕННЫМИ КНОПКАМИ
'use client';
import { useEffect, useState } from 'react';
import MapComponent from '@/components/MapComponent';
import ApartmentList from '@/components/ApartmentList';
import Link from 'next/link';
import { apartments } from '@/types/apartment';
import { sortApartmentsByRelevance } from '@/lib/scoring-algorithm';
import { getSearchCriteria } from '@/lib/search-utils';
import { ScoredApartment, SearchCriteria } from '@/types/scoring';

export default function ResultsPage() {
    const [scoredApartments, setScoredApartments] = useState<ScoredApartment[]>([]);
    const [searchCriteria, setSearchCriteria] = useState<SearchCriteria | null>(null);
    const [selectedApartmentId, setSelectedApartmentId] = useState<number | null>(null);
    const [highlightedApartmentId, setHighlightedApartmentId] = useState<number | null>(null);

    useEffect(() => {
        const criteria = getSearchCriteria();
        setSearchCriteria(criteria);

        if (criteria) {
            const sorted = sortApartmentsByRelevance(apartments, criteria);
            setScoredApartments(sorted);
        } else {
            setScoredApartments(apartments.map(apt => ({
                ...apt,
                relevanceScore: 1,
                isPromoted: false
            })));
        }
    }, []);

    const handleShowOnMap = (apartmentId: number) => {
        setHighlightedApartmentId(apartmentId);
        setTimeout(() => {
            setHighlightedApartmentId(null);
        }, 5000);
    };

    const handleEditSearch = () => {
        if (searchCriteria) {
            let continueStep = 1;

            if (searchCriteria.propertyType === 'apartment') {
                continueStep = 2;
            } else if (searchCriteria.propertyType === 'house') {
                continueStep = 2.5;
            } else if (searchCriteria.propertyType === 'studio') {
                continueStep = 3;
            }

            sessionStorage.setItem('continueSearchData', JSON.stringify({
                searchData: searchCriteria,
                currentStep: continueStep
            }));
        }
    };

    const handleApartmentSelect = (apartmentId: number) => {
        setSelectedApartmentId(apartmentId);
    };

    const relevantApartments = scoredApartments.filter(apt => apt.relevanceScore > 0);
    const bestApartment = relevantApartments[0];
    const similarApartments = relevantApartments.slice(1);

    return (
        <div className="min-h-screen flex flex-col bg-background">
            {/* ХЕДЕР С УМЕНЬШЕННЫМИ КНОПКАМИ */}
            <header className="bg-primary text-primary-foreground px-3 py-2 sm:px-6 sm:py-4 shadow-sm border-b border-black">
                <div className="container mx-auto flex justify-between items-center">
                    <Link href="/" className="text-left hover:opacity-80 transition-opacity">
                        <h1 className="text-lg sm:text-2xl font-bold">СъёмБронь</h1>
                        <p className="text-xs sm:text-sm text-primary-foreground/80 hidden sm:block">
                            Результаты поиска
                        </p>
                    </Link>

                    <nav className="flex gap-2">
                        {/* УМЕНЬШЕННАЯ КНОПКА ВОЙТИ/ЗАРЕГИСТРИРОВАТЬСЯ */}
                        <button className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1.5 rounded-md font-medium transition-colors text-xs min-h-[32px]">
                            Войти
                        </button>
                        {/* УМЕНЬШЕННАЯ КНОПКА ДОБАВИТЬ ЖИЛЬЕ */}
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
                            {bestApartment ? `Найдено ${relevantApartments.length} вариантов` : 'Найдено 0 вариантов'}
                        </h2>
                        <p className="text-gray-600">
                            {bestApartment ? `Лучший вариант: ${bestApartment.title}` : 'Жилье в Нижнем Новгороде по вашему запросу'}
                        </p>
                        {bestApartment && (
                            <p className="text-gray-600">
                                Релевантность: {bestApartment.relevanceScore}/10
                            </p>
                        )}
                    </div>

                    {/* УМЕНЬШЕННЫЕ КНОПКИ ОТРЕДАКТИРОВАТЬ ПОИСК И НОВЫЙ ПОИСК */}
                    <div className="flex gap-2">
                        <Link
                            href="/"
                            onClick={handleEditSearch}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 rounded-md font-medium transition-colors text-xs h-fit min-h-[32px] flex items-center"
                        >
                            Отредактировать поиск
                        </Link>
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
                            apartments={relevantApartments}
                            onApartmentSelect={handleApartmentSelect}
                            selectedApartmentId={selectedApartmentId}
                            highlightedApartmentId={highlightedApartmentId}
                        />
                    </div>

                    <div className="w-full xl:w-5/12 h-full">
                        <ApartmentList
                            apartments={similarApartments}
                            selectedApartmentId={selectedApartmentId}
                            onApartmentSelect={handleApartmentSelect}
                            onShowOnMap={handleShowOnMap}
                        />
                    </div>
                </div>
            </main>

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