// app/results/page.tsx
import MapComponent from '@/components/MapComponent';
import ApartmentList from '@/components/ApartmentList';
import Link from 'next/link';
import { apartments } from '@/types/apartment';

export default function ResultsPage() {
    return (
        <div className="min-h-screen flex flex-col bg-background">
            <header className="bg-primary text-primary-foreground px-4 py-3 sm:px-6 sm:py-4 shadow-sm border-b border-black">
                <div className="container mx-auto flex justify-between items-center">
                    <Link href="/" className="text-left hover:opacity-80 transition-opacity">
                        <h1 className="text-xl sm:text-2xl font-bold">СъёмБронь</h1>
                        <p className="text-xs sm:text-sm text-primary-foreground/80 hidden sm:block">
                            Результаты поиска
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

            <main className="flex-1 container mx-auto px-3 sm:px-6 py-6 flex flex-col">
                <div className="mb-6 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold mb-2">Найдено {apartments.length} вариантов</h2>
                        <p className="text-gray-600">Жилье в Нижнем Новгороде по вашему запросу</p>
                    </div>

                    {/* Кнопка Новый поиск перемещена сюда */}
                    <Link
                        href="/"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium transition-colors text-sm h-fit"
                    >
                        Новый поиск
                    </Link>
                </div>

                {/* Основной контент - занимает всё оставшееся пространство */}
                <div className="flex flex-col xl:flex-row gap-6 flex-grow min-h-0">
                    {/* Карта - 70% ширины */}
                    <div className="w-full xl:w-7/12 h-full">
                        <MapComponent apartments={apartments} />
                    </div>

                    {/* Список похожих вариантов - 30% ширины и занимает всю высоту */}
                    <div className="w-full xl:w-5/12 h-full">
                        <ApartmentList apartments={apartments} />
                    </div>
                </div>
            </main>

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