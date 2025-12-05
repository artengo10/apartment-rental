'use client';

import { useEffect, useState } from 'react';
import SmartSearch from '@/components/SmartSearch';
import Link from 'next/link';
import { MessageCircle, Phone } from 'lucide-react';

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="container mx-auto px-2 sm:px-6 py-4 sm:py-12">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-4xl font-bold tracking-tight mb-3 sm:mb-4">
            Что вы ищете?
          </h2>
        </div>
        <div className="px-1 sm:px-0">
          <div className="animate-pulse">Загрузка поиска...</div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="container mx-auto px-2 sm:px-6 py-4 sm:py-12">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-4xl font-bold tracking-tight mb-3 sm:mb-4">
            Что вы ищете?
          </h2>
        </div>

        <div className="px-1 sm:px-0">
          <SmartSearch />
        </div>
      </div>

      <footer className="bg-gray-50 border-t border-gray-300 mt-8 sm:mt-12">
        <div className="container mx-auto p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
            <div className="text-center sm:text-left">
              <Link href="/" className="hover:opacity-80 transition-opacity inline-block">
                <h3 className="text-base sm:text-lg font-semibold text-gray-900">СъёмБронь</h3>
                <p className="text-xs sm:text-sm text-gray-600">Умный поиск жилья</p>
              </Link>
            </div>

            <div className="text-center sm:text-right">
              <p className="text-xs sm:text-sm text-gray-600">
                © 2024 Все права защищены
              </p>
              <p className="text-xs sm:text-sm text-gray-600">
                Телефон: +7 (999) 123-45-67
              </p>

              {/* Иконки социальных сетей */}
              <div className="flex justify-center sm:justify-end gap-4 mt-3">
                <a
                  href="https://t.me/your_channel"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-blue-500 transition-colors"
                  title="Telegram"
                >
                  <div className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 px-3 py-2 rounded-lg transition-colors">
                    <MessageCircle className="w-5 h-5" />
                    <span className="text-sm hidden xs:inline">Telegram</span>
                  </div>
                </a>

                <a
                  href="https://wa.me/79991234567"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 hover:text-green-500 transition-colors"
                  title="WhatsApp"
                >
                  <div className="flex items-center gap-2 bg-green-50 hover:bg-green-100 px-3 py-2 rounded-lg transition-colors">
                    <Phone className="w-5 h-5" />
                    <span className="text-sm hidden xs:inline">WhatsApp</span>
                  </div>
                </a>
              </div>
            </div>
          </div>

          {/* Дополнительная информация */}
          <div className="mt-6 pt-4 border-t border-gray-200 text-center">
            <div className="flex flex-wrap justify-center gap-4 text-xs text-gray-500">
              <Link href="/about" className="hover:text-blue-600 transition-colors">
                О нас
              </Link>
              <Link href="/help" className="hover:text-blue-600 transition-colors">
                Помощь
              </Link>
              <Link href="/terms" className="hover:text-blue-600 transition-colors">
                Условия использования
              </Link>
              <Link href="/privacy" className="hover:text-blue-600 transition-colors">
                Политика конфиденциальности
              </Link>
              <Link href="/contact" className="hover:text-blue-600 transition-colors">
                Контакты
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </>
  );
}
