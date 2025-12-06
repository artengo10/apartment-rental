// app/layout.tsx
'use client';

import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import Header from '@/components/Header';
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
  const showNavigation = !['/', '/admin'].includes(pathname); // НЕ показываем на главной и админке
  const isHomePage = pathname === '/';
  const isAdminPage = pathname.startsWith('/admin');

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
      <body className={`${isHomePage ? '' : 'min-h-screen'} relative`}>        <AuthProvider>
          {/* Header всегда наверху, кроме админки */}
          {!isAdminPage && <Header />}

          {/* Sidebar для десктопов (если нужна навигация) */}
          {showNavigation && <Sidebar />}

          {/* Основной контент */}
          <main
            className={`
              ${showNavigation ? 'lg:ml-64' : ''} 
              ${isHomePage ? 'mt-0' : 'mt-14'}
            `}
          >
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
