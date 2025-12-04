'use client';

import { Inter } from 'next/font/google';
import { AuthProvider } from '@/context/AuthContext';
import Header from '@/components/Header';
import BottomNavigationBar from '@/components/BottomNavigationBar';
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

  const showBottomNavigation = !['/'].includes(pathname);
  const showHeader = true;

  return (
    <html lang="ru" className={inter.className}>
      <body className={`relative min-h-screen ${showHeader ? 'pt-[56px]' : ''} ${showBottomNavigation ? 'pb-[56px] md:pb-0' : ''}`}>
        <AuthProvider>
          {showHeader && <Header />}
          {showBottomNavigation && <BottomNavigationBar />}
          <main>
            {children}
          </main>
        </AuthProvider>
      </body>
    </html>
  );
}
