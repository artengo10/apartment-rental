'use client';

import { useEffect, useRef, useState } from 'react';
import { Apartment } from '@/types/apartment';
import { yandexMapsLoader } from '@/lib/yandex-maps-loader';
import { X } from 'lucide-react';

const YANDEX_MAPS_API_KEY = process.env.NEXT_PUBLIC_YANDEX_MAPS_API_KEY;

interface FullscreenMapModalProps {
    apartments: Apartment[];
    isOpen: boolean;
    onClose: () => void;
    highlightedApartmentId?: number | null;
}

const FullscreenMapModal = ({
    apartments,
    isOpen,
    onClose,
    highlightedApartmentId
}: FullscreenMapModalProps) => {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstanceRef = useRef<any>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
        };
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        if (!isOpen) return;

        const initializeMap = async () => {
            try {
                setIsLoading(true);

                if (!YANDEX_MAPS_API_KEY || !mapRef.current) return;

                await yandexMapsLoader.load(YANDEX_MAPS_API_KEY);

                // Уничтожаем предыдущую карту
                if (mapInstanceRef.current) {
                    mapInstanceRef.current.destroy();
                }

                // Создаем новую карту
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

                // Добавляем метки
                apartments.forEach(apartment => {
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
    <button onclick="window.open('/apartment/${apartment.id}', '_blank')" style="padding: 8px 12px; background: #10b981; color: white; border: none; border-radius: 6px; cursor: pointer; font-size: 14px; flex: 1;">
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
                            iconImageOffset: [-size / 2, -size / 2],
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
                console.error('Error loading fullscreen map:', error);
                setIsLoading(false);
            }
        };

        initializeMap();

        // Обработчик Escape для закрытия
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onClose();
        };

        document.addEventListener('keydown', handleEscape);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'auto';

            if (mapInstanceRef.current) {
                mapInstanceRef.current.destroy();
                mapInstanceRef.current = null;
            }
        };
    }, [isOpen, apartments, highlightedApartmentId, isMobile]);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black z-[9999] flex flex-col">
            {/* Хедер */}
            <div className="bg-white p-3 flex justify-between items-center shadow-sm">
                <h2 className="text-lg font-semibold">Карта на весь экран</h2>
                <button
                    onClick={onClose}
                    className="p-2 hover:bg-gray-100 rounded-full"
                >
                    <X className="w-6 h-6" />
                </button>
            </div>

            {/* Карта */}
            <div className="flex-1 relative">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100">
                        <div className="text-center">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                            <p className="text-gray-600">Загрузка карты...</p>
                        </div>
                    </div>
                )}

                <div
                    ref={mapRef}
                    className="w-full h-full"
                />
            </div>

            {/* Подсказка для мобилок */}
            <div className="bg-white p-3 text-center text-sm text-gray-600 border-t">
                Нажмите на точку для информации
            </div>
        </div>
    );
};

export default FullscreenMapModal;
