import type { Metadata } from 'next';
import { DM_Sans, DM_Serif_Display, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/api/auth';
import { Toaster } from 'sonner';
import QueryProvider from '@/lib/api/query-provider';
import { SidebarProvider } from '@/lib/context/SidebarContext';
import DashboardLayout from '@/components/layout/DashboardLayout';

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-sans',
});

const dmSerif = DM_Serif_Display({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'PortChain | Maritime Management System',
  description: 'Industrial-grade port blockchain platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${dmSerif.variable} ${jetbrainsMono.variable} font-sans`}>
        <QueryProvider>
          <AuthProvider>
            <SidebarProvider>
              <DashboardLayout>
                {children}
              </DashboardLayout>
              <Toaster richColors position="top-right" />
            </SidebarProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
