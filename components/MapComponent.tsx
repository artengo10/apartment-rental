// components/MapComponent.tsx
'use client';
import { useEffect, useRef, useState } from 'react';
import { Apartment } from '../types/apartment';
import { yandexMapsLoader } from '../lib/yandex-maps-loader';
import { Building, Home } from 'lucide-react';

interface MapComponentProps {
  apartments: Apartment[];
}

const MapComponent = ({ apartments }: MapComponentProps) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;

    const initializeMap = async () => {
      try {
        await yandexMapsLoader.load('57a04b0e-9c7d-4756-9ae3-7618d0469620');

        if (!isMounted || !mapRef.current || !window.ymaps) return;

        const newMap = new window.ymaps.Map(mapRef.current, {
          center: [56.3287, 43.8547],
          zoom: 13,
          controls: ['zoomControl', 'typeSelector', 'fullscreenControl', 'searchControl']
        });

        // Функция для создания SVG иконок
        const createCustomIcon = (type: string) => {
          // Улучшенная иконка квартиры (симметричная)
          const apartmentIconSvg = `
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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

          // Создаем увеличенную иконку с цветным фоном
          const coloredSvg = `
            <svg width="44" height="44" viewBox="0 0 44 44" xmlns="http://www.w3.org/2000/svg">
              <circle cx="22" cy="22" r="20" fill="${getColorByType(type)}" stroke="white" stroke-width="2"/>
              <g transform="translate(10, 10)">
                ${iconSvg}
              </g>
            </svg>
          `;

          return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(coloredSvg)));
        };

        const getColorByType = (type: string) => {
          switch (type) {
            case 'apartment': return '#3B82F6'; // Синий
            case 'house': return '#10B981'; // Зеленый
            case 'studio': return '#9333EA'; // Фиолетовый
            default: return '#3B82F6';
          }
        };

        // Добавляем метки
        apartments.forEach(apartment => {
          const iconUrl = createCustomIcon(apartment.type);

          const placemark = new window.ymaps.Placemark(
            [apartment.lat, apartment.lng],
            {
              balloonContentHeader: `
                <div style="font-size: 16px; font-weight: bold; margin-bottom: 8px; color: ${getColorByType(apartment.type)}">
                  ${apartment.title}
                </div>
              `,
              balloonContentBody: `
                <div style="padding: 8px 0; font-size: 14px; line-height: 1.4;">
                  <p style="margin: 6px 0; font-size: 18px; color: #10b981; font-weight: bold;">${apartment.price}/сутки</p>
                  <p style="margin: 6px 0; color: #374151;"><strong>Адрес:</strong> ${apartment.address}</p>
                  <p style="margin: 6px 0; color: #6b7280;">${apartment.description}</p>
                  <div style="margin: 8px 0; padding: 4px 8px; background: ${getColorByType(apartment.type)}20; border-left: 3px solid ${getColorByType(apartment.type)}; border-radius: 2px;">
                    <span style="color: ${getColorByType(apartment.type)}; font-weight: 500;">
                      ${apartment.type === 'apartment' ? 'Квартира' : apartment.type === 'house' ? 'Дом' : 'Студия'}
                    </span>
                  </div>
                  <div style="margin-top: 12px; display: flex; gap: 8px;">
                    <button 
                      style="padding: 10px 16px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; flex: 1;"
                      onclick="alert('Бронируем: ${apartment.title} - ${apartment.address}')"
                    >
                      Забронировать
                    </button>
                    <button 
                      style="padding: 10px 16px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500; flex: 1;"
                      onclick="alert('Показываем фото: ${apartment.title}')"
                    >
                      Фото
                    </button>
                  </div>
                </div>
              `,
              hintContent: `${apartment.title} - ${apartment.price}`
            },
            {
              iconLayout: 'default#image',
              iconImageHref: iconUrl,
              iconImageSize: [44, 44],
              iconImageOffset: [-22, -22],
              balloonCloseButton: true,
              hideIconOnBalloonOpen: false
            }
          );

          newMap.geoObjects.add(placemark);
        });

        if (isMounted) {
          setMap(newMap);
        }
      } catch (error) {
        console.error('Error loading Yandex Maps:', error);
      }
    };

    initializeMap();

    return () => {
      isMounted = false;
      if (map) {
        map.destroy();
      }
    };
  }, [apartments]);

  return (
    <div className="w-full h-full">
      {/* Легенда - горизонтальная ТОЛЬКО на мобильных, на ПК оставляем как было */}
      <div className="bg-white border-2 border-black rounded-lg p-4 mb-4 shadow-sm">
        <h3 className="text-lg font-semibold mb-3 text-center md:text-left">Обозначения на карте:</h3>

        {/* На мобильных - горизонтально, на ПК - вертикально как было */}
        <div className="md:hidden flex flex-row justify-between items-center gap-2">
          {/* Мобильная версия - горизонтально */}
          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Building className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm text-gray-700 whitespace-nowrap">Квартиры</span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <Home className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm text-gray-700 whitespace-nowrap">Дома</span>
          </div>

          <div className="flex items-center space-x-2">
            <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center flex-shrink-0">
              <Building className="w-3 h-3 text-white" />
            </div>
            <span className="text-sm text-gray-700 whitespace-nowrap">Студии</span>
          </div>
        </div>

        {/* Десктоп версия - оставляем как было */}
        <div className="hidden md:grid grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-2 bg-blue-50 rounded-lg">
            <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center">
              <Building className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-medium text-blue-700">Квартиры</div>
              <div className="text-xs text-blue-600">Многоэтажные дома</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-2 bg-green-50 rounded-lg">
            <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
              <Home className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-medium text-green-700">Дома</div>
              <div className="text-xs text-green-600">Частные дома</div>
            </div>
          </div>

          <div className="flex items-center space-x-3 p-2 bg-purple-50 rounded-lg">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              <Building className="w-5 h-5 text-white" />
            </div>
            <div>
              <div className="font-medium text-purple-700">Студии</div>
              <div className="text-xs text-purple-600">Отдельные помещения</div>
            </div>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-3 text-center md:text-left">
          Нажмите на метку для просмотра подробной информации
        </p>
      </div>

      <div
        ref={mapRef}
        className="w-full h-[300px] sm:h-[400px] md:h-[500px] lg:h-[600px] rounded-lg border-2 border-black shadow-sm"
      />
    </div>
  );
};

export default MapComponent;