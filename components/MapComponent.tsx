// components/MapComponent.tsx - ИСПРАВЛЕННЫЙ С СТАБИЛЬНЫМИ ЗАВИСИМОСТЯМИ
'use client';

import { useEffect, useRef, useState, useMemo } from 'react';
import { Apartment } from '@/types/apartment';
import { yandexMapsLoader } from '@/lib/yandex-maps-loader';
import { RefreshCw, MapPin } from 'lucide-react';
import { useRouter } from 'next/navigation';

const YANDEX_MAPS_API_KEY = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;

interface MapComponentProps {
  apartments: Apartment[];
  selectedApartmentId?: number | null;
  highlightedApartmentId?: number | null;
}

const MapComponent = ({ apartments, selectedApartmentId, highlightedApartmentId }: MapComponentProps) => {
  const router = useRouter();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const placemarksRef = useRef<any[]>([]);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Стабилизируем зависимости с помощью useMemo
  const stableApartments = useMemo(() => apartments, [apartments]);
  const stableSelectedId = useMemo(() => selectedApartmentId, [selectedApartmentId]);
  const stableHighlightedId = useMemo(() => highlightedApartmentId, [highlightedApartmentId]);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Функции для глобального доступа из балуна
  useEffect(() => {
    (window as any).openDetails = (apartmentId: number) => {
      router.push(`/apartment/${apartmentId}`);
    };

    (window as any).makeCall = (title: string, address: string) => {
      alert(`Позвонить по номеру: +7 (999) 123-45-67\nКвартира: ${title}\nАдрес: ${address}`);
    };

    return () => {
      (window as any).openDetails = null;
      (window as any).makeCall = null;
    };
  }, [router]);

  useEffect(() => {
    let isMounted = true;

    const initializeMap = async () => {
      try {
        setIsLoading(true);
        setMapError(null);

        if (!YANDEX_MAPS_API_KEY) {
          throw new Error('Yandex Maps API key not found. Please check your environment variables.');
        }

        const loadPromise = yandexMapsLoader.load(YANDEX_MAPS_API_KEY);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Yandex Maps loading timeout')), 10000)
        );

        await Promise.race([loadPromise, timeoutPromise]);

        if (!isMounted || !mapRef.current || !window.ymaps) {
          return;
        }

        if (mapInstanceRef.current) {
          mapInstanceRef.current.destroy();
          placemarksRef.current = [];
        }

        const defaultZoom = isMobile ? 11 : 12;

        const mapInstance = new window.ymaps.Map(mapRef.current, {
          center: [56.2965, 43.9361],
          zoom: defaultZoom,
          controls: ['zoomControl', 'typeSelector', 'fullscreenControl']
        });

        mapInstanceRef.current = mapInstance;

        // УМЕНЬШЕННЫЕ ЦВЕТНЫЕ КРУЖКИ ДЛЯ ВСЕХ УСТРОЙСТВ
        const createCustomIcon = (type: string, isSelected: boolean = false, isHighlighted: boolean = false) => {
          let fillColor;

          if (isHighlighted) {
            fillColor = getHighlightColorByType(type);
          } else if (isSelected) {
            fillColor = '#F59E0B';
          } else {
            fillColor = getColorByType(type);
          }

          // ЗНАЧИТЕЛЬНО УМЕНЬШЕННЫЕ РАЗМЕРЫ ДЛЯ ВСЕХ УСТРОЙСТВ
          let size;
          if (isHighlighted) {
            size = isMobile ? 28 : 32;
          } else if (isSelected) {
            size = isMobile ? 24 : 28;
          } else {
            size = isMobile ? 20 : 24;
          }

          // ПРОСТОЙ КРУЖОК БЕЗ ИКОНОК ВНУТРИ
          const circleSvg = `
            <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
              <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 1}" fill="${fillColor}" stroke="white" stroke-width="1"/>
            </svg>
          `;

          return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(circleSvg)));
        };

        const getColorByType = (type: string) => {
          switch (type) {
            case 'apartment': return '#3B82F6';
            case 'house': return '#10B981';
            case 'studio': return '#9333EA';
            default: return '#3B82F6';
          }
        };

        const getHighlightColorByType = (type: string) => {
          switch (type) {
            case 'apartment': return '#1D4ED8';
            case 'house': return '#047857';
            case 'studio': return '#7E22CE';
            default: return '#1D4ED8';
          }
        };

        // Очищаем предыдущие метки
        placemarksRef.current.forEach(placemark => {
          mapInstance.geoObjects.remove(placemark);
        });
        placemarksRef.current = [];

        // Добавляем метки
        stableApartments.forEach(apartment => {
          const isSelected = stableSelectedId === apartment.id;
          const isHighlighted = stableHighlightedId === apartment.id;
          const iconUrl = createCustomIcon(apartment.type, isSelected, isHighlighted);

          // ЗНАЧИТЕЛЬНО УМЕНЬШЕННЫЕ РАЗМЕРЫ И СМЕЩЕНИЯ ДЛЯ ВСЕХ УСТРОЙСТВ
          const iconSize = isHighlighted ?
            (isMobile ? [28, 28] : [32, 32]) :
            isSelected ?
              (isMobile ? [24, 24] : [28, 28]) :
              (isMobile ? [20, 20] : [24, 24]);

          const iconOffset = isHighlighted ?
            (isMobile ? [-14, -14] : [-16, -16]) :
            isSelected ?
              (isMobile ? [-12, -12] : [-14, -14]) :
              (isMobile ? [-10, -10] : [-12, -12]);

          // Создаем контент для балуна
          const balloonContent = `
            <div style="max-width: 300px; padding: 8px;">
              <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px; color: ${isSelected ? '#F59E0B' : (isHighlighted ? getHighlightColorByType(apartment.type) : getColorByType(apartment.type))}">
                ${apartment.title} ${isHighlighted ? '⭐' : ''} ${isSelected ? '✓' : ''}
              </div>
              <div style="padding: 8px 0; font-size: 14px; line-height: 1.4;">
                <p style="margin: 6px 0; font-size: 18px; color: #10b981; font-weight: bold;">${apartment.price}/сутки</p>
                <p style="margin: 6px 0; color: #374151;"><strong>Адрес:</strong> ${apartment.address}</p>
                <p style="margin: 6px 0; color: #6b7280;">${apartment.description}</p>
                <div style="margin: 8px 0; padding: 4px 8px; background: ${isSelected ? '#F59E0B20' : (isHighlighted ? getHighlightColorByType(apartment.type) + '20' : getColorByType(apartment.type) + '20')}; border-left: 3px solid ${isSelected ? '#F59E0B' : (isHighlighted ? getHighlightColorByType(apartment.type) : getColorByType(apartment.type))}; border-radius: 2px;">
                  <span style="color: ${isSelected ? '#F59E0B' : (isHighlighted ? getHighlightColorByType(apartment.type) : getColorByType(apartment.type))}; font-weight: 500;">
                    ${apartment.type === 'apartment' ? 'Квартира' : apartment.type === 'house' ? 'Дом' : 'Студия'}
                    ${isSelected ? ' (выбрана)' : ''}
                    ${isHighlighted ? ' (показана на карте)' : ''}
                  </span>
                </div>
                <div style="margin-top: 12px; display: flex; gap: 8px;">
                  <button 
                    onclick="window.openDetails(${apartment.id})"
                    style="padding: 10px 16px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; flex: 1;"
                  >
                    Подробнее
                  </button>
                  <button 
                    onclick="window.makeCall('${apartment.title.replace(/'/g, "\\'")}', '${apartment.address.replace(/'/g, "\\'")}')"
                    style="padding: 10px 16px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; flex: 1;"
                  >
                    Позвонить
                  </button>
                </div>
              </div>
            </div>
          `;

          const placemark = new window.ymaps.Placemark(
            [apartment.lat, apartment.lng],
            {
              balloonContent: balloonContent,
              hintContent: `${apartment.title} - ${apartment.price}${isSelected ? ' ✓' : ''}`
            },
            {
              iconLayout: 'default#image',
              iconImageHref: iconUrl,
              iconImageSize: iconSize,
              iconImageOffset: iconOffset,
              balloonCloseButton: true,
              hideIconOnBalloonOpen: false,
              // ВКЛЮЧАЕМ автоматическое открытие балуна
              openBalloonOnClick: true
            }
          );

          // УПРОЩЕННЫЙ ОБРАБОТЧИК КЛИКА: только открытие балуна, без выделения
          placemark.events.add('click', (e: any) => {
            e.stopPropagation();
            // Балун открывается автоматически благодаря openBalloonOnClick: true
            // Выделение объекта УБРАНО
          });

          mapInstance.geoObjects.add(placemark);
          placemarksRef.current.push(placemark);
        });

        // Центрируем карту на выделенной квартире если есть
        if (stableHighlightedId) {
          const highlightedApartment = stableApartments.find(apt => apt.id === stableHighlightedId);
          if (highlightedApartment) {
            mapInstance.setCenter([highlightedApartment.lat, highlightedApartment.lng], isMobile ? 13 : 14, {
              duration: 500
            });

            // Находим и открываем балун выделенной квартиры
            setTimeout(() => {
              const highlightedPlacemark = placemarksRef.current.find(pm =>
                pm.geometry.getCoordinates()[0] === highlightedApartment.lat &&
                pm.geometry.getCoordinates()[1] === highlightedApartment.lng
              );
              if (highlightedPlacemark) {
                highlightedPlacemark.balloon.open();
              }
            }, 600);
          }
        }

        setMapError(null);
        setIsLoading(false);
      } catch (error) {
        console.error('Error loading Yandex Maps:', error);
        setMapError('Не удалось загрузить карту. Пожалуйста, обновите страницу.');
        setIsLoading(false);
      }
    };

    initializeMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
      }
      placemarksRef.current = [];
    };
  }, [stableApartments, stableSelectedId, stableHighlightedId, isMobile]);

  if (mapError) {
    return (
      <div className="w-full h-full">
        <div className="bg-white border-2 border-black rounded-lg p-4 mb-4 shadow-sm">
          <h3 className="text-lg font-semibold mb-3">Карта</h3>
          <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
            <div className="text-center p-4">
              <div className="text-4xl mb-2">🗺️</div>
              <p className="text-gray-600 mb-2">{mapError}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                Обновить страницу
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full">
      {/* Легенда С ПРОСТЫМИ КРУЖКАМИ ДЛЯ ВСЕХ УСТРОЙСТВ */}
      <div className="bg-white border-2 border-black rounded-lg p-3 mb-3 shadow-sm">
        <h3 className="text-base font-semibold mb-2 text-center sm:text-left">Обозначения:</h3>

        {/* УНИФИЦИРОВАННАЯ ЛЕГЕНДА ДЛЯ ВСЕХ УСТРОЙСТВ */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-blue-500 rounded-full flex-shrink-0"></div>
            <span className="text-xs text-gray-700">Квартиры</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-green-500 rounded-full flex-shrink-0"></div>
            <span className="text-xs text-gray-700">Дома</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-purple-600 rounded-full flex-shrink-0"></div>
            <span className="text-xs text-gray-700">Студии</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-3 h-3 bg-orange-500 rounded-full flex-shrink-0"></div>
            <span className="text-xs text-gray-700">Выбранные</span>
          </div>
        </div>

        {stableHighlightedId && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-2">
            <p className="text-xs text-blue-800 font-medium flex items-center gap-1">
              <MapPin className="w-3 h-3" />
              Объект выделен на карте
            </p>
          </div>
        )}

        {stableSelectedId && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-2">
            <p className="text-xs text-orange-800 font-medium">
              ✅ Выбран объект в списке
            </p>
          </div>
        )}
      </div>

      {isLoading && (
        <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg border-2 border-black mb-4">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-gray-600">Загрузка карты...</p>
          </div>
        </div>
      )}

      <div
        ref={mapRef}
        className={`w-full rounded-lg border-2 border-black shadow-sm ${isLoading ? 'hidden' : 'block'
          } h-[300px] xs:h-[350px] sm:h-[400px] md:h-[500px] lg:h-[600px]`}
      />
    </div>
  );
};

export default MapComponent;