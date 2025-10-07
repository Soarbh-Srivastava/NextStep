'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  GoogleAuthProvider,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useAuth } from '@/hooks/use-auth';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Chrome, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';

const authSchema = z.object({
  email: z.string().email('Please enter a valid email address.'),
  password: z
    .string()
    .min(6, 'Password must be at least 6 characters long.'),
});

type AuthFormValues = z.infer<typeof authSchema>;

export default function LoginPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isGoogleSubmitting, setIsGoogleSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  const form = useForm<AuthFormValues>({
    resolver: zodResolver(authSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const handleGoogleSignIn = async () => {
    // This function will be updated as per user's request.
    // The current implementation is a placeholder.
    setIsGoogleSubmitting(true);
    const provider = new GoogleAuthProvider();
    // signInWithRedirect(auth, provider);
    // For now, we'll just log to console to avoid breaking the app
    console.log("Attempting Google Sign-In. A redirect-based flow will be implemented here.");
    setTimeout(() => {
        toast({
            title: "Google Sign-In",
            description: "This feature is being updated to work reliably on all devices."
        })
        setIsGoogleSubmitting(false)
    }, 1500)
  };

  const handleRegister = async (values: AuthFormValues) => {
    setIsSubmitting(true);
    try {
      await createUserWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: 'Registration Successful',
        description: 'Welcome! You are now signed in.',
      });
      router.push('/dashboard');
    } catch (error: any) {
      const isEmailInUse = error.code === 'auth/email-already-in-use';
      toast({
        variant: 'destructive',
        title: 'Registration Failed',
        description: isEmailInUse
            ? 'This email is already registered.'
            : error.message || 'An error occurred during registration.',
      });
      if (!isEmailInUse) {
        console.error('Error registering user:', error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogin = async (values: AuthFormValues) => {
    setIsSubmitting(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      router.push('/dashboard');
    } catch (error: any) {
      const isInvalidCredentials = error.code === 'auth/invalid-credential' || error.code === 'auth/wrong-password';
      
      toast({
        variant: 'destructive',
        title: 'Login Failed',
        description: isInvalidCredentials
            ? 'Invalid email or password.'
            : error.message || 'An unexpected error occurred.',
      });
      
      if (!isInvalidCredentials) {
        console.error('Error signing in:', error);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading || user) {
    return <div className="flex h-screen w-full items-center justify-center"><Loader2 className="h-8 w-8 animate-spin" /></div>;
  }

  return (
    
    <div className="flex min-h-screen w-full items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
            <CardHeader className="text-center">
            <CardTitle className="text-2xl">Welcome to NextStep</CardTitle>
            <CardDescription>
                Choose your preferred method to sign in or register.
            </CardDescription>
            </CardHeader>
            <CardContent>
            <Tabs defaultValue="login" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="login">Login</TabsTrigger>
                <TabsTrigger value="register">Register</TabsTrigger>
                </TabsList>
                <TabsContent value="login">
                <Form {...form}>
                    <form
                    onSubmit={form.handleSubmit(handleLogin)}
                    className="space-y-4 pt-4"
                    >
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                            <Input
                                type="email"
                                placeholder="you@example.com"
                                {...field}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Sign In
                    </Button>
                    </form>
                </Form>
                </TabsContent>
                <TabsContent value="register">
                <Form {...form}>
                    <form
                    onSubmit={form.handleSubmit(handleRegister)}
                    className="space-y-4 pt-4"
                    >
                    <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                            <Input
                                type="email"
                                placeholder="you@example.com"
                                {...field}
                            />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="password"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Password</FormLabel>
                            <FormControl>
                            <Input type="password" placeholder="••••••••" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <Button type="submit" className="w-full" disabled={isSubmitting}>
                        {isSubmitting && (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        )}
                        Create Account
                    </Button>
                    </form>
                </Form>
                </TabsContent>
            </Tabs>

            <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                    Or continue with
                </span>
                </div>
            </div>

            <Button
                onClick={handleGoogleSignIn}
                className="w-full"
                variant="outline"
                disabled={isGoogleSubmitting}
            >
                {isGoogleSubmitting ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                <Chrome className="mr-2 h-4 w-4" />
                )}
                Sign in with Google
            </Button>

            <div className="mt-6 text-center text-sm text-muted-foreground">
                <Link href="/" className="underline hover:text-primary">
                Back to homepage
                </Link>
            </div>
            </CardContent>
        </Card>
    </div>
  );
}
