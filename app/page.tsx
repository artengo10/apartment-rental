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
      <div className="container mx-auto px-4 py-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold tracking-tight mb-4">
            Что вы ищете?
          </h2>
        </div>
        <div className="animate-pulse">Загрузка поиска...</div>
      </div>
    );
  }

  return (
    <div className="home-page-main ios-scroll-fix android-scroll-fix no-pull-to-refresh">
      <div className="container mx-auto px-2 sm:px-6 py-4 sm:py-12">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-4xl font-bold tracking-tight mb-3 sm:mb-4">
            Что вы ищете?
          </h2>
        </div>

        <div className="px-1 sm:px-0 force-scroll-mobile">
          <SmartSearch />
        </div>
      </div>

      {/* Простой футер */}
      <footer className="bg-gray-50 border-t border-gray-300 mt-12">
        <div className="container mx-auto p-6">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">СъёмБронь</h3>
            <p className="text-sm text-gray-600 mb-4">Умный поиск жилья</p>
            <p className="text-xs text-gray-500">
              © 2024 Все права защищены
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}