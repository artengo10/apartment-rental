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

  return (
    <html lang="ru" className={inter.className}>
      <body className="min-h-screen bg-background">
        <AuthProvider>
          {/* Header всегда наверху */}
          <Header />

          {/* Sidebar для десктопов (если нужна навигация) */}
          {showNavigation && <Sidebar />}

          {/* Основной контент с отступами */}
          <main className={`min-h-screen ${showNavigation ? 'lg:ml-64' : ''}`}>
            {children}
          </main>

          {/* BottomNavigationBar для мобильных (если нужна навигация) */}
          {showNavigation && <BottomNavigationBar />}
        </AuthProvider>
      </body>
    </html>
  );
}
