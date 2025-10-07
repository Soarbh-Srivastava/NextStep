'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { Loader2 } from 'lucide-react';
import { usePathname, useRouter } from 'next/navigation';

type AuthContextType = {
  user: User | null;
  loading: boolean;
};

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

const publicRoutes = ['/', '/login'];
const authRoutes = ['/dashboard', '/applications', '/calendar', '/settings'];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);

      const isAuthRoute = authRoutes.some(route => pathname.startsWith(route)) || pathname.startsWith('/applications/');

      if (user) {
        // If user is logged in, redirect from public-only pages like login
        if (pathname === '/login' || pathname === '/') {
          router.push('/dashboard');
        }
      } else {
        // If user is not logged in, redirect from protected routes
        if (isAuthRoute) {
          router.push('/login');
        }
      }
    });

    return () => unsubscribe();
  }, [pathname, router]);

  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route)) || pathname.startsWith('/applications/');

  // Show a loader while auth state is resolving, or if a redirect is imminent.
  // This prevents content flashing and ensures users don't see pages they shouldn't.
  if (loading || (!user && isAuthRoute) || (user && (pathname === '/login' || pathname === '/'))) {
    return (
        <div className="flex h-screen w-full items-center justify-center">
            <Loader2 className="h-8 w-8 animate-spin" />
        </div>
    );
  }


  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
