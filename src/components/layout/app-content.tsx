'use client';
import { useAuth } from '@/hooks/use-auth';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { SidebarInset } from '@/components/ui/sidebar';
import { AuthProvider } from '@/hooks/use-auth';
import FirebaseErrorListener from '@/components/FirebaseErrorListener';

const publicRoutes = ['/', '/login'];
const authRoutes = ['/dashboard', '/applications', '/calendar', '/settings'];

function AuthWrapper({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return; // Wait until authentication state is resolved

    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route)) || pathname.startsWith('/applications/');

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
  
  const isFullPage = publicRoutes.includes(pathname);
  if (isFullPage && !user) {
    return <>{children}</>;
  }

  // Render a loading state during redirection to prevent flash of content
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route)) || pathname.startsWith('/applications/');
  if (loading || (!user && isAuthRoute) || (user && (pathname === '/login' || pathname === '/'))) {
    return <SidebarInset className="flex-1" />;
  }
  
  return (
    <SidebarInset className="flex-1">
      <FirebaseErrorListener />
      {children}
    </SidebarInset>
  );
}


export default function AppContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isFullPage = publicRoutes.includes(pathname);

  if (isFullPage) {
     return (
        <AuthProvider>
            <AuthWrapper>{children}</AuthWrapper>
        </AuthProvider>
     )
  }
  
  return <AuthWrapper>{children}</AuthWrapper>;
}
