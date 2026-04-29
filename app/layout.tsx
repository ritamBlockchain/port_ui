import type { Metadata } from 'next';
import { Roboto, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AuthProvider } from '@/lib/api/auth';
import { Toaster } from 'sonner';
import QueryProvider from '@/lib/api/query-provider';
import { SidebarProvider } from '@/lib/context/SidebarContext';
import DashboardLayout from '@/components/layout/DashboardLayout';

const roboto = Roboto({
  weight: ['300', '400', '500', '700', '900'],
  subsets: ['latin'],
  variable: '--font-sans',
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
      <body className={`${roboto.variable} ${jetbrainsMono.variable} font-sans`}>
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
