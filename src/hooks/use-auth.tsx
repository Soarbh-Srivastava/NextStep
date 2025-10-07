'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { onAuthStateChanged, User, getRedirectResult } from 'firebase/auth';
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
  const [redirectLoading, setRedirectLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Check for redirect result first. This is crucial for Google Sign-In.
    getRedirectResult(auth)
      .then((result) => {
        // If result is null, it means we are not coming from a redirect.
        // If there's a result, onAuthStateChanged will handle the user state.
      })
      .catch((error) => {
        // Handle errors from the redirect.
        console.error("Error during sign-in redirect:", error);
      })
      .finally(() => {
        // We're done checking for a redirect.
        setRedirectLoading(false);
      });

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    // Wait until both initial loading and redirect check are complete.
    if (loading || redirectLoading) {
      return;
    }

    const isAuthRoute = authRoutes.some(route => pathname.startsWith(route)) || pathname.startsWith('/applications/');

    if (user) {
      // If user is logged in, redirect from public-only pages like login.
      if (pathname === '/login' || pathname === '/') {
        router.push('/dashboard');
      }
    } else {
      // If user is not logged in, redirect from protected routes.
      if (isAuthRoute) {
        router.push('/login');
      }
    }
  }, [user, loading, redirectLoading, pathname, router]);

  // Show a loader while auth state is resolving or a redirect is being processed.
  if (loading || redirectLoading) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return <AuthContext.Provider value={{ user, loading }}>{children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);
