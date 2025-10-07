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
    if (!loading && !user && !publicRoutes.includes(pathname)) {
      router.push('/login');
    }
  }, [user, loading, router, pathname]);

  if (loading) {
    return <SidebarInset className="flex-1" />;
  }
  
  if (!user && !publicRoutes.includes(pathname)) {
    return <SidebarInset className="flex-1" />;
  }

  if (user && publicRoutes.includes(pathname)) {
      router.push('/');
      return <SidebarInset className="flex-1" />;
  }

  return <SidebarInset className="flex-1">{children}</SidebarInset>;
}
