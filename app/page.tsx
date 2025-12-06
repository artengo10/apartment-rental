'use client';

import { useEffect, useState } from 'react';
import SmartSearch from '@/components/SmartSearch';

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);

    // Фикс для скролла на iOS
    const fixIOSScroll = () => {
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
      document.documentElement.style.overflow = 'auto';

      // Добавляем класс для мобильных
      if (window.innerWidth <= 768) {
        document.body.classList.add('mobile-scroll-enabled');
        document.body.setAttribute('data-page', '/');
      }
    };

    fixIOSScroll();
    window.addEventListener('resize', fixIOSScroll);

    // Пересчитываем высоту при изменении ориентации
    const handleResize = () => {
      setTimeout(fixIOSScroll, 100);
    };

    window.addEventListener('orientationchange', handleResize);

    return () => {
      window.removeEventListener('resize', fixIOSScroll);
      window.removeEventListener('orientationchange', handleResize);
      document.body.classList.remove('mobile-scroll-enabled');
      document.body.removeAttribute('data-page');
    };
  }, []);

  if (!isClient) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Что вы ищете?
          </h2>
          <div className="animate-pulse">Загрузка поиска...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      {/* Главный контейнер с правильными отступами */}
      <div className="flex-1 pt-20 sm:pt-24 pb-8">
        <div className="max-w-4xl mx-auto px-3 sm:px-6 lg:px-8">

          {/* Заголовок */}
          <div className="text-center mb-6 sm:mb-8">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight mb-4 text-gray-900">
              Что вы ищете?
            </h1>
          </div>

          {/* Анкета SmartSearch */}
          <div className="mt-4 sm:mt-6">
            <SmartSearch />
          </div>
        </div>
      </div>

      {/* Футер */}
      <footer className="bg-gray-900 text-white py-8 mt-auto">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h3 className="text-xl font-semibold mb-4">СъёмБронь</h3>
            <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
              Сервис поиска и бронирования жилья в Нижегородской области
            </p>
            <div className="text-sm text-gray-400">
              <p>© 2024 Все права защищены</p>
              <p className="mt-2">Работаем в Нижнем Новгороде, Дзержинске, Арзамасе и других городах области</p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}