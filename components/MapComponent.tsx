'use client';
import { useEffect, useRef, useState } from 'react';
import { apartments } from '../types/apartment';
import { loadYandexMap, initializeMap } from '../lib/yandex-map';
import ApartmentList from './ApartmentList';

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
        await loadYandexMap('57a04b0e-9c7d-4756-9ae3-7618d0469620');
        if (mapRef.current) {
          // Передаем current, а не весь ref
          const newMap = initializeMap(mapRef.current, apartments);
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
      <div className="mb-4 p-3 bg-blue-50 rounded-lg">
        <p className="text-blue-800 font-medium">
          🏠 Найдено {apartments.length} квартир в Сормовском районе
        </p>
      </div>

      <div
        ref={mapRef}
        className="w-full h-[400px] sm:h-[500px] md:h-[600px] lg:h-[700px] rounded-lg border-2 border-black shadow-sm mb-8"
      />

      <ApartmentList apartments={apartments} />
    </div>
  );
};

export default MapComponent;