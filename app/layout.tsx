// app/layout.tsx
'use client';

import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import Header from '@/components/Header';
import BottomNavigationBar from '@/components/BottomNavigationBar';
import Sidebar from '@/components/Sidebar';
import './globals.css';
import { usePathname } from 'next/navigation';

const inter = Inter({
  subsets: ['latin', 'cyrillic'],
  display: 'swap',
});

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // Определяем, нужна ли навигация на текущей странице
  const showNavigation = !['/'].includes(pathname); // НЕ показываем на главной
  const isHomePage = pathname === '/';

  return (
    <html lang="ru" className={inter.className}>
      <head>
        <meta
          name="viewport"
          content="width=device-width, initial-scale=1.0, minimum-scale=1.0, maximum-scale=5.0"
        />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="mobile-web-app-capable" content="yes" />
      </head>
      <body className={`bg-background ${isHomePage ? 'overflow-auto' : 'min-h-screen'}`}>
        <AuthProvider>
          {/* Header всегда наверху */}
          <Header />

          {/* Sidebar для десктопов (если нужна навигация) */}
          {showNavigation && <Sidebar />}

          {/* Основной контент */}
          <main className={`${showNavigation ? 'lg:ml-64' : ''} ${isHomePage ? 'mt-14' : 'min-h-screen'}`}>
            {children}
          </main>

          {/* BottomNavigationBar для мобильных (если нужна навигация) */}
          {showNavigation && <BottomNavigationBar />}
        </AuthProvider>

        {/* Абсолютный скрипт для фикса скролла на главной */}
        {isHomePage && (
          <script
            dangerouslySetInnerHTML={{
              __html: `
                document.addEventListener('DOMContentLoaded', function() {
                  // Фикс для iOS скролла
                  document.body.style.height = 'auto';
                  document.body.style.overflow = 'auto';
                  document.documentElement.style.overflow = 'auto';
                  
                  // Фикс для touch событий
                  document.addEventListener('touchmove', function(e) {
                    e.stopPropagation();
                  }, { passive: true });
                });
              `
            }}
          />
        )}
      </body>
    </html>
  );
}
