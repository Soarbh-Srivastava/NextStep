'use client';
import { useAuth } from '@/hooks/use-auth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SidebarInset } from '@/components/ui/sidebar';

const publicRoutes = ['/', '/login'];
const authRoutes = ['/dashboard', '/applications', '/calendar', '/settings'];

export default function AppContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return; // Wait until authentication state is resolved

    const isPublic = publicRoutes.includes(pathname) || pathname.startsWith('/applications/');
    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route));
    
    if (!user && isAuthRoute) {
      router.push('/login');
    }
    
    if (user && pathname === '/login') {
      router.push('/dashboard');
    }

    if (user && pathname === '/') {
        router.push('/dashboard');
    }

  }, [user, loading, router, pathname]);

  const isFullPage = pathname === '/login' || pathname === '/';
  if (isFullPage && !user) {
    return <>{children}</>;
  }


  // Render a loading state during redirection to prevent flash of content
  if (loading || (!user && authRoutes.some(route => pathname.startsWith(route))) || (user && pathname === '/login')) {
    return <SidebarInset className="flex-1" />;
  }
  
  return (
    <SidebarInset className="flex-1">
      {children}
    </SidebarInset>
  );
}
