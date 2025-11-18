// components/MapComponent.tsx - ИСПРАВЛЕННЫЙ ЗУМ И ИКОНКИ
'use client';

import { useEffect, useRef, useState } from 'react';
import { Apartment } from '../types/apartment';
import { yandexMapsLoader } from '../lib/yandex-maps-loader';
import { Building, Home, Check, RefreshCw } from 'lucide-react';
import { useRouter } from 'next/navigation';

const YANDEX_MAPS_API_KEY = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;

interface MapComponentProps {
  apartments: Apartment[];
  onApartmentSelect?: (apartmentId: number) => void;
  selectedApartmentId?: number | null;
  highlightedApartmentId?: number | null;
}

const MapComponent = ({ apartments, onApartmentSelect, selectedApartmentId, highlightedApartmentId }: MapComponentProps) => {
  const router = useRouter();
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Определяем мобильное устройство
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  useEffect(() => {
    let isMounted = true;

    const initializeMap = async () => {
      try {
        setIsLoading(true);
        setMapError(null);

        console.log('Initializing Yandex Maps...');
        console.log('API Key present:', !!YANDEX_MAPS_API_KEY);

        if (!YANDEX_MAPS_API_KEY) {
          throw new Error('Yandex Maps API key not found. Please check your environment variables.');
        }

        // Добавляем таймаут для загрузки карт
        const loadPromise = yandexMapsLoader.load(YANDEX_MAPS_API_KEY);
        const timeoutPromise = new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Yandex Maps loading timeout')), 10000)
        );

        await Promise.race([loadPromise, timeoutPromise]);

        if (!isMounted || !mapRef.current || !window.ymaps) {
          console.log('Component unmounted or DOM not ready');
          return;
        }

        console.log('Yandex Maps loaded successfully');

        // Если карта уже существует, уничтожаем её
        if (mapInstanceRef.current) {
          mapInstanceRef.current.destroy();
        }

        // УСТАНАВЛИВАЕМ РАЗНЫЙ ЗУМ ДЛЯ МОБИЛЬНЫХ И ДЕСКТОПА
        const defaultZoom = isMobile ? 11 : 12;

        const mapInstance = new window.ymaps.Map(mapRef.current, {
          center: [56.2965, 43.9361],
          zoom: defaultZoom,
          controls: ['zoomControl', 'typeSelector', 'fullscreenControl']
        });

        mapInstanceRef.current = mapInstance;

        // Функция для создания SVG иконок с РАЗМЕРАМИ ДЛЯ МОБИЛЬНЫХ
        const createCustomIcon = (type: string, isSelected: boolean = false, isHighlighted: boolean = false) => {
          const apartmentIconSvg = `
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect x="3" y="3" width="18" height="18" rx="1" stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <rect x="6" y="6" width="4" height="4" fill="white"/>
              <rect x="14" y="6" width="4" height="4" fill="white"/>
              <rect x="6" y="14" width="4" height="4" fill="white"/>
              <rect x="14" y="14" width="4" height="4" fill="white"/>
              <line x1="10" y1="6" x2="10" y2="18" stroke="white" stroke-width="2" stroke-linecap="round"/>
              <line x1="6" y1="10" x2="18" y2="10" stroke="white" stroke-width="2" stroke-linecap="round"/>
            </svg>
          `;

          const houseIconSvg = `
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8" 
                    stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
              <path d="M3 10a2 2 0 0 1 .709-1.528l7-6a2 2 0 0 1 2.582 0l7 6A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" 
                    stroke="white" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          `;

          let iconSvg;
          switch (type) {
            case 'apartment':
            case 'studio':
              iconSvg = apartmentIconSvg;
              break;
            case 'house':
              iconSvg = houseIconSvg;
              break;
            default:
              iconSvg = apartmentIconSvg;
          }

          // РАЗМЕРЫ ИКОНОК ДЛЯ МОБИЛЬНЫХ И ДЕСКТОПА
          let size, strokeWidth, fillColor;

          if (isHighlighted) {
            // Выделенная метка
            size = isMobile ? 44 : 48;
            strokeWidth = isMobile ? 2.5 : 3;
            fillColor = getHighlightColorByType(type);
          } else if (isSelected) {
            // ВЫБРАННАЯ МЕТКА - ОРАНЖЕВЫЙ
            size = isMobile ? 38 : 42;
            strokeWidth = isMobile ? 2 : 2.5;
            fillColor = '#F59E0B';
          } else {
            // Обычная метка
            size = isMobile ? 32 : 36;
            strokeWidth = isMobile ? 1.5 : 2;
            fillColor = getColorByType(type);
          }

          const coloredSvg = `
            <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
              <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="${fillColor}" stroke="white" stroke-width="${strokeWidth}"/>
              <g transform="translate(${(size - 22) / 2}, ${(size - 22) / 2})">
                ${iconSvg}
              </g>
            </svg>
          `;

          return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(coloredSvg)));
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

        // Добавляем метки
        apartments.forEach(apartment => {
          const isSelected = selectedApartmentId === apartment.id;
          const isHighlighted = highlightedApartmentId === apartment.id;
          const iconUrl = createCustomIcon(apartment.type, isSelected, isHighlighted);

          // РАСЧЕТ СМЕЩЕНИЯ ДЛЯ МОБИЛЬНЫХ И ДЕСКТОПА
          const iconSize = isHighlighted ?
            (isMobile ? [44, 44] : [48, 48]) :
            isSelected ?
              (isMobile ? [38, 38] : [42, 42]) :
              (isMobile ? [32, 32] : [36, 36]);

          const iconOffset = isHighlighted ?
            (isMobile ? [-22, -22] : [-24, -24]) :
            isSelected ?
              (isMobile ? [-19, -19] : [-21, -21]) :
              (isMobile ? [-16, -16] : [-18, -18]);

          const placemark = new window.ymaps.Placemark(
            [apartment.lat, apartment.lng],
            {
              balloonContentHeader: `
                <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px; color: ${isSelected ? '#F59E0B' : (isHighlighted ? getHighlightColorByType(apartment.type) : getColorByType(apartment.type))
                }">
                  ${apartment.title} ${isHighlighted ? '⭐' : ''} ${isSelected ? '✓' : ''}
                </div>
              `,
              balloonContentBody: `
                <div style="padding: 8px 0; font-size: 14px; line-height: 1.4;">
                  <p style="margin: 6px 0; font-size: 18px; color: #10b981; font-weight: bold;">${apartment.price}/сутки</p>
                  <p style="margin: 6px 0; color: #374151;"><strong>Адрес:</strong> ${apartment.address}</p>
                  <p style="margin: 6px 0; color: #6b7280;">${apartment.description}</p>
                  <div style="margin: 8px 0; padding: 4px 8px; background: ${isSelected ? '#F59E0B20' : (isHighlighted ? getHighlightColorByType(apartment.type) + '20' : getColorByType(apartment.type) + '20')
                }; border-left: 3px solid ${isSelected ? '#F59E0B' : (isHighlighted ? getHighlightColorByType(apartment.type) : getColorByType(apartment.type))
                }; border-radius: 2px;">
                    <span style="color: ${isSelected ? '#F59E0B' : (isHighlighted ? getHighlightColorByType(apartment.type) : getColorByType(apartment.type))
                }; font-weight: 500;">
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
                      onclick="window.makeCall('${apartment.title}', '${apartment.address}')"
                      style="padding: 10px 16px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; flex: 1;"
                    >
                      Позвонить
                    </button>
                  </div>
                </div>
              `,
              hintContent: `${apartment.title} - ${apartment.price}${isSelected ? ' ✓' : ''}`
            },
            {
              iconLayout: 'default#image',
              iconImageHref: iconUrl,
              iconImageSize: iconSize,
              iconImageOffset: iconOffset,
              balloonCloseButton: true,
              hideIconOnBalloonOpen: false
            }
          );

          // Обработчик клика на метку
          placemark.events.add('click', (e: any) => {
            e.stopPropagation();
            if (onApartmentSelect) {
              onApartmentSelect(apartment.id);
            }
          });

          placemark.events.add('dblclick', (e: any) => {
            e.stopPropagation();
            placemark.balloon.open();
          });

          mapInstance.geoObjects.add(placemark);
        });

        // Центрируем карту на выделенной квартире
        if (highlightedApartmentId) {
          const highlightedApartment = apartments.find(apt => apt.id === highlightedApartmentId);
          if (highlightedApartment) {
            mapInstance.setCenter([highlightedApartment.lat, highlightedApartment.lng], isMobile ? 13 : 14, {
              duration: 500
            });
          }
        }

        // Глобальные функции для кнопок в балуне
        (window as any).openDetails = (apartmentId: number) => {
          router.push(`/apartment/${apartmentId}`);
        };

        (window as any).makeCall = (title: string, address: string) => {
          alert(`Позвонить по номеру: +7 (999) 123-45-67\nКвартира: ${title}\nАдрес: ${address}`);
        };

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
      (window as any).openDetails = null;
      (window as any).makeCall = null;
    };
  }, [apartments, onApartmentSelect, selectedApartmentId, highlightedApartmentId, router, isMobile]);

  // Остальной код компонента без изменений...
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
      {/* Легенда - КОМПАКТНАЯ ДЛЯ МОБИЛЬНЫХ */}
      <div className="bg-white border-2 border-black rounded-lg p-3 mb-3 shadow-sm">
        <h3 className="text-base font-semibold mb-2 text-center sm:text-left">Обозначения:</h3>

        {/* Мобильная легенда - более компактная */}
        <div className="grid grid-cols-2 gap-2 mb-3 sm:hidden">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-blue-500 rounded-full flex-shrink-0"></div>
            <span className="text-xs text-gray-700">Квартиры</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-green-500 rounded-full flex-shrink-0"></div>
            <span className="text-xs text-gray-700">Дома</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-purple-600 rounded-full flex-shrink-0"></div>
            <span className="text-xs text-gray-700">Студии</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 bg-orange-500 rounded-full flex-shrink-0"></div>
            <span className="text-xs text-gray-700">Выбранные</span>
          </div>
        </div>

        {/* Десктопная легенда */}
        <div className="hidden sm:grid grid-cols-4 gap-3 mb-3">
          <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded-lg">
            <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
              <Building className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-medium text-blue-700 text-sm">Квартиры</div>
            </div>
          </div>

          <div className="flex items-center space-x-2 p-2 bg-green-50 rounded-lg">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
              <Home className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-medium text-green-700 text-sm">Дома</div>
            </div>
          </div>

          <div className="flex items-center space-x-2 p-2 bg-purple-50 rounded-lg">
            <div className="w-8 h-8 bg-purple-600 rounded-full flex items-center justify-center">
              <Building className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-medium text-purple-700 text-sm">Студии</div>
            </div>
          </div>

          <div className="flex items-center space-x-2 p-2 bg-orange-50 rounded-lg">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center">
              <Check className="w-4 h-4 text-white" />
            </div>
            <div>
              <div className="font-medium text-orange-700 text-sm">Выбранные</div>
            </div>
          </div>
        </div>

        {highlightedApartmentId && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-2 mb-2">
            <p className="text-xs text-blue-800 font-medium">
              💡 Выделен объект на карте
            </p>
          </div>
        )}

        {selectedApartmentId && (
          <div className="bg-orange-50 border border-orange-200 rounded-lg p-2 mb-2">
            <p className="text-xs text-orange-800 font-medium">
              ✅ Выбран объект в списке
            </p>
          </div>
        )}

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-2">
          <p className="text-xs text-yellow-800 font-medium mb-1">💡 Как пользоваться:</p>
          <ul className="text-xs text-yellow-700 list-disc list-inside space-y-0.5">
            <li><strong>Клик</strong> - выделить в списке</li>
            <li><strong>Двойной клик</strong> - подробности</li>
            <li><strong>Кнопка "🗺️"</strong> - показать на карте</li>
          </ul>
        </div>
      </div>

      {/* Индикатор загрузки */}
      {isLoading && (
        <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg border-2 border-black mb-4">
          <div className="text-center">
            <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-2" />
            <p className="text-gray-600">Загрузка карты...</p>
          </div>
        </div>
      )}

      {/* Карта с адаптивной высотой */}
      <div
        ref={mapRef}
        className={`w-full rounded-lg border-2 border-black shadow-sm ${isLoading ? 'hidden' : 'block'
          } h-[300px] xs:h-[350px] sm:h-[400px] md:h-[500px] lg:h-[600px]`}
      />
    </div>
  );
};

export default MapComponent;