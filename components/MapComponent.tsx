'use client';
import { useEffect, useRef, useState } from 'react';
import { apartments } from '../types/apartment';
import { loadYandexMap, initializeMap } from '../lib/yandex-map';
import ApartmentList from './ApartmentList';

// Добавь это объявление глобального интерфейса
declare global {
  interface Window {
    ymaps: any;
  }
}

const MapComponent = () => {
  const mapRef = useRef<HTMLDivElement>(null);
  const [map, setMap] = useState<any>(null);

  useEffect(() => {
    const init = async () => {
      try {
        await loadYandexMap('ТВОЙ_API_КЛЮЧ');
        if (mapRef.current) {
          const newMap = initializeMap(mapRef, apartments);
          setMap(newMap);
        }
      } catch (error) {
        console.error('Error loading Yandex Maps:', error);
      }
    };

    init();

    return () => {
      if (map) {
        map.destroy();
      }
    };
  }, []);

  return (
    <div className="w-full h-full">
      {/* Информация о количестве квартир БЕЗ бордера */}
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-blue-800 font-medium">
          🏠 Найдено {apartments.length} квартир в Сормовском районе
        </p>
      </div>

      {/* Карта с черной границей */}
      <div
        ref={mapRef}
        className="w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] rounded-lg border-2 border-black shadow-sm mb-8"
      />

      {/* Список квартир */}
      <ApartmentList apartments={apartments} />
    </div>
  );
};

export default MapComponent;