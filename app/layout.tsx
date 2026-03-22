import type { Metadata, Viewport } from 'next';
import { Lexend, Manrope } from 'next/font/google';
import './globals.css';
import TopBar from '@/components/TopBar';
import BottomNav from '@/components/BottomNav';
import { AppProvider } from '@/components/AppProvider';

const lexend = Lexend({
  subsets: ['latin'],
  variable: '--font-lexend',
  weight: ['400', '700', '800', '900'],
});

const manrope = Manrope({
  subsets: ['latin'],
  variable: '--font-manrope',
  weight: ['400', '500', '600', '700'],
});

export const metadata: Metadata = {
  title: 'HyperStrive AI',
  description: 'AI-powered hypertrophy and nutrition tracker.',
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'HyperStrive',
  },
};

export const viewport: Viewport = {
  themeColor: '#0c0e12',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${lexend.variable} ${manrope.variable} dark`}>
      <body className="bg-surface text-on-surface font-body selection:bg-primary selection:text-surface antialiased pb-28 pt-20 min-h-screen flex flex-col">
        <AppProvider>
          <TopBar />
          <main className="flex-1 max-w-2xl w-full mx-auto px-4 sm:px-6">
            {children}
          </main>
          <BottomNav />
        </AppProvider>
      </body>
    </html>
  );
}

