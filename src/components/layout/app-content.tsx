'use client';
import { useAuth } from '@/hooks/use-auth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SidebarInset } from '@/components/ui/sidebar';

const publicRoutes = ['/login'];

export default function AppContent({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return; // Wait until authentication state is resolved

    const isPublic = publicRoutes.includes(pathname);

    if (!user && !isPublic) {
      router.push('/login');
    }
    
    if (user && isPublic) {
      router.push('/');
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return <SidebarInset className="flex-1" />;
  }
  
  // Render a loading state during redirection to prevent flash of content
  if (!user && !publicRoutes.includes(pathname)) {
    return <SidebarInset className="flex-1" />;
  }

  if (user && publicRoutes.includes(pathname)) {
      return <SidebarInset className="flex-1" />;
  }

  return <SidebarInset className="flex-1">{children}</SidebarInset>;
}
