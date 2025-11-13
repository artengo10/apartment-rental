import MapComponent from '@/components/MapComponent';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Хедер с черной границей снизу */}
      <header className="bg-primary text-primary-foreground px-4 py-3 sm:px-6 sm:py-4 shadow-sm border-b border-black">
        <div className="container mx-auto flex justify-between items-center">
          {/* Логотип слева */}
          <div className="text-left">
            <h1 className="text-xl sm:text-2xl font-bold">СъёмБронь</h1>
            <p className="text-xs sm:text-sm text-primary-foreground/80 hidden sm:block">
              Посуточная аренда в Нижнем Новгороде
            </p>
          </div>

          {/* Кнопка справа - зеленая */}
          <nav>
            <button className="bg-green-600 hover:bg-green-700 text-white px-4 sm:px-6 py-2 rounded-md font-medium transition-colors text-sm sm:text-base border border-black">
              Добавить квартиру
            </button>
          </nav>
        </div>
      </header>

      {/* Основной контент */}
      <main className="flex-1 container mx-auto px-3 sm:px-6 py-4 sm:py-6">
        {/* Заголовок без бордера */}
        <div className="mb-4 sm:mb-6 p-4 bg-white">
          <h2 className="text-xl sm:text-3xl font-bold tracking-tight mb-2 text-center sm:text-left">
            Квартиры в Сормовском районе
          </h2>
          <p className="text-muted-foreground text-sm sm:text-base text-center sm:text-left">
            Найдите идеальный вариант для посуточной аренды
          </p>
        </div>

        {/* Карта */}
        <div className="mb-8">
          <MapComponent />
        </div>

        {/* Блок статистики с тонкими бордерами */}
        <div className="mt-8 sm:mt-12 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4 text-center">
          <div className="bg-muted p-3 sm:p-4 rounded-lg border border-gray-300">
            <p className="text-lg sm:text-2xl font-bold text-primary">50+</p>
            <p className="text-muted-foreground text-xs sm:text-sm">квартир в базе</p>
          </div>
          <div className="bg-muted p-3 sm:p-4 rounded-lg border border-gray-300">
            <p className="text-lg sm:text-2xl font-bold text-primary">24/7</p>
            <p className="text-muted-foreground text-xs sm:text-sm">поддержка</p>
          </div>
          <div className="bg-muted p-3 sm:p-4 rounded-lg border border-gray-300">
            <p className="text-lg sm:text-2xl font-bold text-primary">100%</p>
            <p className="text-muted-foreground text-xs sm:text-sm">безопасная оплата</p>
          </div>
        </div>
      </main>

      {/* Футер с тонкой границей сверху */}
      <footer className="bg-muted/50 border-t border-gray-300 mt-12 sm:mt-16">
        <div className="container mx-auto p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
            <div className="text-center sm:text-left">
              <h3 className="text-base sm:text-lg font-semibold">СъёмБронь</h3>
              <p className="text-xs sm:text-sm text-muted-foreground">Посуточная аренда квартир</p>
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