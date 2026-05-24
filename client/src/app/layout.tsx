import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import ReduxProvider from '@/store/provider';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster } from '@/components/ui/sonner';
import { ThemeWrapper } from '@/components/shared/ThemeWrapper';

const geistSans = Geist({
  variable: '--font-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'MFG CRM - Manufacturing Sales CRM',
  description:
    'A modern CRM system designed for manufacturing companies to manage leads, track sales pipelines, and boost team performance.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <ReduxProvider>
          <ThemeWrapper>
            <TooltipProvider delayDuration={300}>
              {children}
              <Toaster richColors position="top-right" />
            </TooltipProvider>
          </ThemeWrapper>
        </ReduxProvider>
      </body>
    </html>
  );
}
