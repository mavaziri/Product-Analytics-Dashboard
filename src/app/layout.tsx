import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Header } from '@/components/Header';
import { Footer } from '@/components/Footer';
import { ThemeProvider } from './providers/ThemeProvider';
import { getThemeCookie } from './actions/theme.actions';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Product Analytics Dashboard',
  description:
    'A comprehensive product analytics dashboard built with Next.js 15',
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const theme = await getThemeCookie();

  return (
    <html lang="en" className={theme} suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider initialTheme={theme}>
          <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
