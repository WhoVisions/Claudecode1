import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';
import { MainLayout } from '@/components/layout/MainLayout';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'AiwithDav3 - Enterprise Platform',
  description: 'AI-powered enterprise solutions. Create APIs, manage users, and scale your business with cutting-edge technology.',
  keywords: ['AI', 'Enterprise', 'API', 'Platform', 'Automation', 'Agentverse'],
  authors: [{ name: 'Cool Visions LLC' }],
  creator: 'Dave Meralus',
  publisher: 'Cool Visions LLC',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://aiwithdav3.com',
    siteName: 'AiwithDav3',
    title: 'AiwithDav3 - Enterprise Platform',
    description: 'AI-powered enterprise solutions for the modern business',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'AiwithDav3 Enterprise Platform',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'AiwithDav3 - Enterprise Platform',
    description: 'AI-powered enterprise solutions for the modern business',
    creator: '@aiwithdav3',
    images: ['/og-image.png'],
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
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider>
          <MainLayout>{children}</MainLayout>
        </ThemeProvider>
      </body>
    </html>
  );
}
