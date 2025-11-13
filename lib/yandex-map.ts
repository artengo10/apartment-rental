import { Apartment } from "../types/apartment";

declare global {
  interface Window {
    ymaps: any;
  }
}

// Изменяем тип параметра на HTMLDivElement вместо RefObject
export const initializeMap = (
  mapElement: HTMLDivElement,
  apartments: Apartment[]
) => {
  if (!window.ymaps) return null;

  const map = new window.ymaps.Map(mapElement, {
    center: [56.3287, 43.8547],
    zoom: 13,
    controls: [
      "zoomControl",
      "typeSelector",
      "fullscreenControl",
      "searchControl",
    ],
  });

  apartments.forEach((apartment) => {
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
        hintContent: `${apartment.title} - ${apartment.price}`,
      },
      {
        preset: "islands#blueHomeIcon",
        balloonCloseButton: true,
        hideIconOnBalloonOpen: false,
      }
    );

    map.geoObjects.add(placemark);
  });

  return map;
};

export const loadYandexMap = (apiKey: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.ymaps) {
      window.ymaps.ready(resolve);
      return;
    }

    const script = document.createElement("script");
    script.src = `https://api-maps.yandex.ru/2.1/?apikey=${apiKey}&lang=ru_RU`;
    script.onload = () => window.ymaps.ready(resolve);
    script.onerror = reject;
    document.head.appendChild(script);
  });
};
