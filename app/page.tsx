// app/page.tsx - ОБНОВЛЕННЫЙ ХЕДЕР С МЕНЬШИМИ КНОПКАМИ
'use client';

import SmartSearch from '@/components/SmartSearch';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* ХЕДЕР С УМЕНЬШЕННЫМИ КНОПКАМИ */}
      <header className="bg-primary text-primary-foreground px-3 py-2 sm:px-6 sm:py-4 shadow-sm border-b border-black">
        <div className="container mx-auto flex justify-between items-center">
          <Link
            href="/"
            className="text-left hover:opacity-80 transition-opacity"
            onClick={() => {
              if (window.location.pathname === '/') {
                window.location.reload();
              }
            }}
          >
            <h1 className="text-lg sm:text-2xl font-bold">СъёмБронь</h1>
            <p className="text-xs text-primary-foreground/80 hidden xs:block">
              Умный поиск жилья в Нижнем Новгороде
            </p>
          </Link>

          <nav className="flex gap-2">
            {/* УМЕНЬШЕННАЯ КНОПКА ВОЙТИ/ЗАРЕГИСТРИРОВАТЬСЯ */}
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-2 py-1.5 rounded-md font-medium transition-colors text-xs min-h-[32px]">
              Войти
            </button>
            {/* УМЕНЬШЕННАЯ КНОПКА ДОБАВИТЬ ЖИЛЬЕ */}
            <button className="bg-green-600 hover:bg-green-700 text-white px-2 sm:px-3 py-1.5 rounded-md font-medium transition-colors text-xs border border-black min-h-[32px]">
              Добавить
            </button>
          </nav>
        </div>
      </header>

      {/* Остальной код без изменений */}
      <main className="flex-1 container mx-auto px-2 sm:px-6 py-4 sm:py-12">
        <div className="text-center mb-6 sm:mb-8">
          <h2 className="text-xl sm:text-4xl font-bold tracking-tight mb-3 sm:mb-4">
            Найдем идеальное жилье для вас
          </h2>
          <p className="text-muted-foreground text-sm sm:text-lg max-w-2xl mx-auto">
            Ответьте на несколько вопросов, и мы подберем лучшие варианты
            в Сормовском районе Нижнего Новгорода
          </p>
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