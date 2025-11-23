'use client';

import { useEffect, useState } from 'react';
import SmartSearch from '@/components/SmartSearch';
import Link from 'next/link';
import Header from '@/components/Header';

export default function Home() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // На сервере показываем простой контент без использования auth
  if (!isClient) {
    return (
      <div className="min-h-screen flex flex-col bg-background">
        <div className="container mx-auto px-2 sm:px-6 py-4 sm:py-12">
          <div className="text-center mb-6 sm:mb-8">
            <h2 className="text-xl sm:text-4xl font-bold tracking-tight mb-3 sm:mb-4">
              Найдем идеальное жилье для вас
            </h2>
          </div>
          <div className="px-1 sm:px-0">
            <div className="animate-pulse">Загрузка поиска...</div>
          </div>
        </div>
      </div>
    );
  }

  // На клиенте показываем полный контент
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Header />

      <main className="flex-1 container mx-auto px-2 sm:px-6 py-4 sm:py-12">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-4xl font-bold tracking-tight mb-3 sm:mb-4">
            Найдем идеальное жилье для вас
          </h2>
        </div>

        <div className="px-1 sm:px-0">
          <SmartSearch />
        </div>
      </main>

      <footer className="bg-muted/50 border-t border-gray-300 mt-8 sm:mt-12">
        <div className="container mx-auto p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
            <div className="text-center sm:text-left">
              <Link href="/" className="hover:opacity-80 transition-opacity">
                <h3 className="text-base sm:text-lg font-semibold">СъёмБронь</h3>
                <p className="text-xs sm:text-sm text-muted-foreground">Умный поиск жилья</p>
              </Link>
            </div>
            <div className="text-center sm:text-right">
              <p className="text-xs sm:text-sm text-muted-foreground">
                © 2024 Все права защищены
              </p>
              <p className="text-xs sm:text-sm text-muted-foreground">
                Телефон: +7 (999) 123-45-67
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
