import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Toaster } from '@/components/ui/toaster';
import { SidebarProvider } from '@/components/ui/sidebar';
import AppSidebar from '@/components/layout/app-sidebar';
import { AuthProvider } from '@/hooks/use-auth';
import AppContent from '@/components/layout/app-content';
import FirebaseErrorListener from '@/components/FirebaseErrorListener';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' });

export const metadata: Metadata = {
  title: 'NextStep',
  description: 'A personal job-application tracker.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} font-body antialiased`}>
        <AuthProvider>
          <SidebarProvider>
            <div className="flex min-h-screen">
              <AppSidebar />
              <AppContent>
                {children}
              </AppContent>
            </div>
            <Toaster />
            <FirebaseErrorListener />
          </SidebarProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
