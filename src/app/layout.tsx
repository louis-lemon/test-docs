import '@/app/global.css';
import { Provider } from '@/components/provider';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'Test Docs',
    template: '%s | Test Docs',
  },
  description: 'Documentation site built with Fumadocs',
  keywords: ['documentation', 'fumadocs', 'nextjs', 'react'],
  authors: [{ name: 'Test Docs Team' }],
  creator: 'Test Docs Team',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://louis-lemon.github.io/test-docs',
    title: 'Test Docs',
    description: 'Documentation site built with Fumadocs',
    siteName: 'Test Docs',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Test Docs',
    description: 'Documentation site built with Fumadocs',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function Layout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen bg-white dark:bg-fd-background">
        <Provider>{children}</Provider>
      </body>
    </html>
  );
}
