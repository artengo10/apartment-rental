// app/page.tsx
import SmartSearch from '@/components/SmartSearch';
import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Хедер */}
      <header className="bg-primary text-primary-foreground px-4 py-3 sm:px-6 sm:py-4 shadow-sm border-b border-black">
        <div className="container mx-auto flex justify-between items-center">
          {/* Логотип как ссылка */}
          <Link href="/" className="text-left hover:opacity-80 transition-opacity">
            <h1 className="text-xl sm:text-2xl font-bold">СъёмБронь</h1>
            <p className="text-xs sm:text-sm text-primary-foreground/80 hidden sm:block">
              Умный поиск жилья в Нижнем Новгороде
            </p>
          </Link>

          <nav className="flex gap-4">
            {/* Добавлена кнопка Войти/Зарегистрироваться */}
            <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors text-sm">
              Войти/Зарегистрироваться
            </button>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 rounded-md font-medium transition-colors text-sm sm:text-base border border-black">
              Добавить жилье
            </button>
          </nav>
        </div>
      </header>

      {/* Основной контент - только умный поиск */}
      <main className="flex-1 container mx-auto px-3 sm:px-6 py-8 sm:py-12">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-4xl font-bold tracking-tight mb-4">
            Найдем идеальное жилье для вас
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
            Ответьте на несколько вопросов, и мы подберем лучшие варианты
            в Сормовском районе Нижнего Новгорода
          </p>
        </div>

        {/* Компонент умного поиска */}
        <SmartSearch />
      </main>

      {/* Футер */}
      <footer className="bg-muted/50 border-t border-gray-300 mt-12">
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