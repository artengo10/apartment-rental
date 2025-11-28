'use client';

import { useEffect, useState, useRef } from 'react';
import MapComponent from '@/components/MapComponent';
import ApartmentList from '@/components/ApartmentList';
import FilterModal from '@/components/FilterModal';
import Link from 'next/link';
import { getSearchCriteria } from '@/lib/search-utils';
import { SearchCriteria } from '@/types/scoring';
import { filterApartments } from '@/lib/filter-apartments';
import Header from '@/components/Header';
import { useAuth } from '@/context/AuthContext';
import { Apartment } from '@/types/apartment'; // Используем единый интерфейс

// Интерфейс для данных из API
interface ApiApartment {
    id: number;
    lat: number;
    lng: number;
    title: string;
    price: number;
    address: string;
    description: string;
    type: string;
    district: string;
    rooms?: number;
    area?: number;
    floor?: number;
    images: string[];
    amenities: string[];
    host: {
        name: string;
        phone: string;
    };
    hostId: number;
    isPublished?: boolean;
    status?: string;
}

export default function ResultsPage() {
    const [isClient, setIsClient] = useState(false);
    const [apartments, setApartments] = useState<Apartment[]>([]);
    const [filteredApartments, setFilteredApartments] = useState<Apartment[]>([]);
    const [searchCriteria, setSearchCriteria] = useState<SearchCriteria | null>(null);
    const [selectedApartmentId, setSelectedApartmentId] = useState<number | null>(null);
    const [highlightedApartmentId, setHighlightedApartmentId] = useState<number | null>(null);
    const [showFilterModal, setShowFilterModal] = useState(false);
    const [isMobile, setIsMobile] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const mapContainerRef = useRef<HTMLDivElement>(null);

    const { user, isLoading: authLoading } = useAuth();

    useEffect(() => {
        setIsClient(true);

        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };

        checkMobile();
        window.addEventListener('resize', checkMobile);

        fetchApartments();

        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    // Функция преобразования данных из API в формат Apartment
    const transformApiDataToApartment = (apiApartment: ApiApartment): Apartment => {
        const transformType = (type: string): "apartment" | "house" | "studio" => {
            const lowerType = type.toLowerCase();
            if (lowerType === 'apartment' || lowerType === 'house' || lowerType === 'studio') {
                return lowerType as "apartment" | "house" | "studio";
            }
            return 'apartment';
        };

        return {
            id: apiApartment.id,
            lat: apiApartment.lat || 56.2965,
            lng: apiApartment.lng || 43.9361,
            title: apiApartment.title,
            price: `${apiApartment.price}₽`,
            address: apiApartment.address,
            description: apiApartment.description,
            type: transformType(apiApartment.type),
            district: apiApartment.district,
            rooms: apiApartment.rooms,
            area: apiApartment.area,
            floor: apiApartment.floor,
            photos: apiApartment.images || [], // images -> photos
            amenities: apiApartment.amenities || [],
            hostName: apiApartment.host?.name || 'Неизвестно',
            hostId: apiApartment.hostId,
            hostRating: 4.5
        };
    };

    const fetchApartments = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('/api/apartments');
            if (response.ok) {
                const data: ApiApartment[] = await response.json();

                const transformedApartments: Apartment[] = data.map(transformApiDataToApartment);

                setApartments(transformedApartments);
                setFilteredApartments(transformedApartments);

                const criteria = getSearchCriteria();
                setSearchCriteria(criteria);

                if (criteria) {
                    const filtered = filterApartments(transformedApartments, criteria);
                    setFilteredApartments(filtered);
                }
            } else {
                throw new Error('Ошибка загрузки квартир');
            }
        } catch (error) {
            console.error('Ошибка загрузки квартир:', error);
            setError('Не удалось загрузить объявления. Попробуйте обновить страницу.');
        } finally {
            setLoading(false);
        }
    };

    const handleShowOnMap = (apartmentId: number) => {
        setHighlightedApartmentId(current =>
            current === apartmentId ? null : apartmentId
        );

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

    const handleRetry = () => {
        fetchApartments();
    };

    if (!isClient) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Header />
                <div className="container mx-auto px-3 sm:px-6 py-6 flex-1">
                    <div className="mb-6">
                        <h2 className="text-lg sm:text-2xl font-bold mb-2">Загрузка результатов...</h2>
                        <p className="text-gray-600 text-xs sm:text-base">Нижний Новгород</p>
                    </div>
                    <div className="flex flex-col xl:flex-row gap-6 flex-grow min-h-0">
                        <div className="w-full xl:w-7/12 h-64 sm:h-96 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-full xl:w-5/12 space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Header />
                <div className="container mx-auto px-3 sm:px-6 py-6 flex-1">
                    <div className="mb-6">
                        <h2 className="text-lg sm:text-2xl font-bold mb-2">Загрузка объявлений...</h2>
                        <p className="text-gray-600 text-xs sm:text-base">Нижний Новгород</p>
                    </div>
                    <div className="flex flex-col xl:flex-row gap-6 flex-grow min-h-0">
                        <div className="w-full xl:w-7/12 h-64 sm:h-96 bg-gray-200 rounded animate-pulse"></div>
                        <div className="w-full xl:w-5/12 space-y-4">
                            {[1, 2, 3].map(i => (
                                <div key={i} className="h-32 bg-gray-200 rounded animate-pulse"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen flex flex-col bg-background">
                <Header />
                <div className="container mx-auto px-3 sm:px-6 py-6 flex-1 flex flex-col items-center justify-center">
                    <div className="text-center max-w-md">
                        <div className="text-6xl mb-4">😔</div>
                        <h2 className="text-xl font-bold mb-2">Произошла ошибка</h2>
                        <p className="text-gray-600 mb-6">{error}</p>
                        <button
                            onClick={handleRetry}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
                        >
                            Попробовать снова
                        </button>
                        <Link
                            href="/"
                            className="ml-4 bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md font-medium transition-colors inline-block"
                        >
                            На главную
                        </Link>
                    </div>
                </div>
            </div>
        );
    }

    const selectedTypeText = searchCriteria?.propertyType === 'apartment' ? 'Квартиры' :
        searchCriteria?.propertyType === 'house' ? 'Дома' :
            searchCriteria?.propertyType === 'studio' ? 'Студии' : 'Все варианты';

    return (
        <div className="min-h-screen flex flex-col bg-background">
            <Header />

            <main className="flex-1 container mx-auto px-3 sm:px-6 py-6 flex flex-col">
                <div className="mb-6 flex justify-between items-center">
                    <div>
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

                    <div className="flex gap-2">
                        <button
                            onClick={() => setShowFilterModal(true)}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1.5 sm:px-3 sm:py-1.5 rounded-md font-medium transition-colors text-xs sm:text-xs h-fit min-h-[36px] sm:min-h-[32px] flex items-center whitespace-nowrap"
                        >
                            Фильтр
                        </button>

                        {user && (
                            <Link
                                href="/my-apartments"
                                className="bg-purple-600 hover:bg-purple-700 text-white px-3 py-1.5 sm:px-3 sm:py-1.5 rounded-md font-medium transition-colors text-xs sm:text-xs h-fit min-h-[36px] sm:min-h-[32px] flex items-center whitespace-nowrap"
                            >
                                Мои объявления
                            </Link>
                        )}

                        <Link
                            href="/"
                            className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 sm:px-3 sm:py-1.5 rounded-md font-medium transition-colors text-xs sm:text-xs h-fit min-h-[36px] sm:min-h-[32px] flex items-center whitespace-nowrap"
                        >
                            Новый поиск
                        </Link>
                    </div>
                </div>

                {filteredApartments.length === 0 ? (
                    <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                        <div className="text-6xl mb-4">🔍</div>
                        <h3 className="text-xl font-bold mb-2">Ничего не найдено</h3>
                        <p className="text-gray-600 mb-6 max-w-md">
                            Попробуйте изменить параметры поиска или сбросить фильтры
                        </p>
                        <div className="flex gap-4">
                            <button
                                onClick={() => setShowFilterModal(true)}
                                className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
                            >
                                Изменить фильтры
                            </button>
                            <button
                                onClick={() => {
                                    sessionStorage.removeItem('searchCriteria');
                                    setFilteredApartments(apartments);
                                    setSearchCriteria(null);
                                }}
                                className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-md font-medium transition-colors"
                            >
                                Сбросить фильтры
                            </button>
                        </div>
                    </div>
                ) : (
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
                )}
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