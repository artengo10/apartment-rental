// components/MapComponent.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import { Apartment } from '@/types/apartment';
import { yandexMapsLoader } from '@/lib/yandex-maps-loader';
import { RefreshCw, Maximize2 } from 'lucide-react';
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
  const [mapError, setMapError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(false);

  // Обработчик клика на кнопку полноэкранного режима
  const handleFullscreenClick = () => {
    const event = new CustomEvent('openFullscreenMap');
    window.dispatchEvent(event);
  };

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

        if (!YANDEX_MAPS_API_KEY) {
          throw new Error('Yandex Maps API key not found.');
        }

        // Загружаем Яндекс.Карты
        await yandexMapsLoader.load(YANDEX_MAPS_API_KEY);

        if (!isMounted || !mapRef.current || !window.ymaps) return;

        // Удаляем старую карту если есть
        if (mapInstanceRef.current) {
          mapInstanceRef.current.destroy();
        }

        // Создаем карту
        const mapInstance = new window.ymaps.Map(mapRef.current, {
          center: [56.2965, 43.9361],
          zoom: 12,
          controls: ['zoomControl', 'typeSelector']
        });

        mapInstanceRef.current = mapInstance;

        // Функция для создания цветной точки
        const createColoredCircle = (color: string, size: number = 24) => {
          const svg = `
            <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
              <circle cx="${size / 2}" cy="${size / 2}" r="${size / 2 - 2}" fill="${color}" stroke="white" stroke-width="2"/>
            </svg>
          `;
          return 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svg)));
        };

        // Функция для получения цвета по типу жилья
        const getColorByType = (type: string) => {
          switch (type) {
            case 'apartment': return '#3B82F6'; // Синий для квартир
            case 'house': return '#10B981';     // Зеленый для домов
            case 'studio': return '#9333EA';    // Фиолетовый для студий
            default: return '#3B82F6';
          }
        };

        // Добавляем метки-точки
        apartments.forEach(apartment => {
          const isSelected = selectedApartmentId === apartment.id;
          const isHighlighted = highlightedApartmentId === apartment.id;

          // Получаем цвет по типу
          const color = getColorByType(apartment.type);

          // Размер точки: обычная - 24px, выделенная - 28px
          const size = isHighlighted ? 28 : 24;
          const iconUrl = createColoredCircle(color, size);

          // Создаем HTML для балуна
          const balloonContent = `
<div style="max-width: 280px; padding: 12px;">
  <div style="margin-bottom: 8px;">
    <a href="/apartment/${apartment.id}" style="font-size: 16px; font-weight: bold; color: ${color}; text-decoration: none;">
      ${apartment.title}
    </a>
  </div>
  <div style="margin-bottom: 8px;">
    <span style="font-size: 18px; color: #10b981; font-weight: bold;">${apartment.price}</span>
    <span style="color: #6b7280; font-size: 14px;">/ сутки</span>
  </div>
  <div style="margin-bottom: 12px; color: #374151; font-size: 14px;">
    📍 ${apartment.address}
  </div>
  <div style="display: flex; gap: 6px;">
    <button onclick="window.location.href='/apartment/${apartment.id}'" style="padding: 8px 12px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; flex: 1;">
      Подробнее
    </button>
    <button onclick="alert('Позвонить по номеру: +7 (999) 123-45-67')" style="padding: 8px 12px; background: #3b82f6; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; flex: 1;">
      Позвонить
    </button>
  </div>
</div>`;

          const placemark = new window.ymaps.Placemark(
            [apartment.lat, apartment.lng],
            {
              balloonContent: balloonContent,
              hintContent: apartment.title
            },
            {
              iconLayout: 'default#image',
              iconImageHref: iconUrl,
              iconImageSize: [size, size],
              iconImageOffset: [-size / 2, -size / 2], // Центрируем точку
              balloonCloseButton: true,
              hideIconOnBalloonOpen: false,
              openBalloonOnClick: true
            }
          );

          mapInstance.geoObjects.add(placemark);

          // Если выделенная квартира, центрируем на ней
          if (isHighlighted) {
            mapInstance.setCenter([apartment.lat, apartment.lng], 14);
            placemark.balloon.open();
          }
        });

        setIsLoading(false);
      } catch (error) {
        console.error('Error loading map:', error);
        setMapError('Не удалось загрузить карту');
        setIsLoading(false);
      }
    };

    initializeMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.destroy();
      }
    };
  }, [apartments, selectedApartmentId, highlightedApartmentId, isMobile]);

  if (mapError) {
    return (
      <div className="w-full h-full">
        <div className="bg-white border-2 border-black rounded-lg p-4 mb-4">
          <h3 className="text-lg font-semibold mb-3">Карта</h3>
          <div className="flex items-center justify-center h-64 bg-gray-100 rounded-lg">
            <div className="text-center p-4">
              <div className="text-4xl mb-2">🗺️</div>
              <p className="text-gray-600 mb-2">{mapError}</p>
              <button
                onClick={() => window.location.reload()}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2 mx-auto"
              >
                <RefreshCw className="w-4 h-4" />
                Обновить
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative">
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

      {/* Кнопка полноэкранного режима */}
      {!isLoading && (
        <button
          onClick={handleFullscreenClick}
          className="absolute top-3 right-3 bg-white/90 hover:bg-white border border-gray-300 rounded-lg p-2 shadow-lg"
          title="Открыть на весь экран"
        >
          <Maximize2 className="w-5 h-5 text-gray-700" />
        </button>
      )}
    </div>
  );
};

export default MapComponent;
