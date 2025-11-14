'use client';
import { useEffect, useRef, useState } from 'react';
import { Apartment } from '../types/apartment';
import { yandexMapsLoader } from '../lib/yandex-maps-loader';

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
        // Используем глобальный загрузчик
        await yandexMapsLoader.load('57a04b0e-9c7d-4756-9ae3-7618d0469620');

        if (!isMounted || !mapRef.current || !window.ymaps) return;

        const newMap = new window.ymaps.Map(mapRef.current, {
          center: [56.3287, 43.8547],
          zoom: 13,
          controls: ['zoomControl', 'typeSelector', 'fullscreenControl', 'searchControl']
        });

        // Добавляем метки квартир
        apartments.forEach(apartment => {
          const placemark = new window.ymaps.Placemark(
            [apartment.lat, apartment.lng],
            {
              balloonContentHeader: `<div style="font-size: 16px; font-weight: bold; margin-bottom: 8px;">${apartment.title}</div>`,
              balloonContentBody: `
                <div style="padding: 8px 0; font-size: 14px; line-height: 1.4;">
                  <p style="margin: 6px 0; font-size: 18px; color: #10b981; font-weight: bold;">${apartment.price}/сутки</p>
                  <p style="margin: 6px 0; color: #374151;"><strong>Адрес:</strong> ${apartment.address}</p>
                  <p style="margin: 6px 0; color: #6b7280;">${apartment.description}</p>
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
              preset: 'islands#blueHomeIcon',
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
      <div
        ref={mapRef}
        className="w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] rounded-lg border-2 border-black shadow-sm"
      />
    </div>
  );
};

export default MapComponent;