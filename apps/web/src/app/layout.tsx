import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/contexts/auth.context';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

export const metadata: Metadata = {
  title: 'Civora — AI-Powered Civic Problem Reporting Platform',
  description:
    'Report, verify, research, and resolve community problems with the power of AI. Turn civic issues into actionable intelligence.',
  keywords: ['civic tech', 'problem reporting', 'AI', 'community', 'government', 'civic intelligence'],
  openGraph: {
    title: 'Civora — Report. Verify. Research. Resolve.',
    description: 'AI-powered civic problem reporting platform for smarter communities.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#080d14" />
      </head>
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
