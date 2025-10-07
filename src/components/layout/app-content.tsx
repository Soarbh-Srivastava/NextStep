'use client';
import { useAuth } from '@/hooks/use-auth';
import { usePathname } from 'next/navigation';
import { SidebarInset } from '@/components/ui/sidebar';
import AppHeader from './app-header';

const publicRoutes = ['/', '/login'];

export default function AppContent({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();

  // If we are on a public route and the user is not logged in, show the content directly.
  const isPublicPage = publicRoutes.includes(pathname);
  if (isPublicPage && !user) {
    return <>{children}</>;
  }

  // For authenticated users or when transitioning, show the main app layout.
  return (
    <SidebarInset className="flex-1 flex flex-col">
       <AppHeader />
       <div className="flex-1">
        {children}
      </div>
    </SidebarInset>
  );
}
