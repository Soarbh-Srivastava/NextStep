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
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route)) || pathname.startsWith('/applications/');

    if (!user && isAuthRoute) {
      router.push('/login');
    }

    if (user && (pathname === '/login' || pathname === '/')) {
      router.push('/dashboard');
    }
  }, [user, loading, router, pathname]);

  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route)) || pathname.startsWith('/applications/');

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
