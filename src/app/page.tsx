import { Button } from '@/components/ui/button';
import { ArrowRight, Briefcase, Calendar, Target } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <div className="bg-background">
      <header className="container mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
        <div className="flex items-center gap-2">
            <Briefcase className="w-8 h-8 text-primary" />
            <h1 className="text-2xl font-bold">NextStep</h1>
        </div>
        <nav className="flex items-center gap-4">
          <Button variant="ghost" asChild>
            <Link href="/login">Log In</Link>
          </Button>
          <Button asChild>
            <Link href="/login">
              Get Started <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </nav>
      </header>
      <main className="grid md:grid-cols-2 min-h-[calc(100vh-10rem)] items-center">
        <div className="hidden md:flex items-center justify-center p-8">
            <Image
                src="https://postimg.cc/3kSC5gnP"
                alt="Person organizing job applications"
                width={800}
                height={600}
                className="rounded-lg shadow-lg"
                data-ai-hint="job search"
            />
        </div>

        <section className="py-20 md:py-32">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center md:text-left">
            <h2 className="text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
              Take the Next Step in Your Career
            </h2>
            <p className="mt-6 max-w-2xl mx-auto md:mx-0 text-lg text-muted-foreground">
              NextStep is a personal job application tracker that helps you manage your job search, stay organized, and land your dream job.
            </p>
            <div className="mt-10">
              <Button size="lg" asChild>
                <Link href="/login">
                  Start Tracking for Free <ArrowRight className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

        <section className="bg-muted py-20">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-12">
                    <h3 className="text-3xl font-bold">All-in-one Job Search Management</h3>
                    <p className="mt-4 text-muted-foreground">Everything you need to stay on top of your applications.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                    <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-4">
                            <Briefcase className="h-8 w-8" />
                        </div>
                        <h4 className="text-xl font-semibold">Track Applications</h4>
                        <p className="mt-2 text-muted-foreground">Manage every detail of your applications, from job descriptions to timelines.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-4">
                            <Target className="h-8 w-8" />
                        </div>
                        <h4 className="text-xl font-semibold">Visualize Your Progress</h4>
                        <p className="mt-2 text-muted-foreground">Use interactive charts and funnels to see how your job search is performing.</p>
                    </div>
                    <div className="flex flex-col items-center">
                        <div className="flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 text-primary mb-4">
                            <Calendar className="h-8 w-8" />
                        </div>
                        <h4 className="text-xl font-semibold">Never Miss a Date</h4>
                        <p className="mt-2 text-muted-foreground">Keep track of interviews and deadlines with an integrated calendar.</p>
                    </div>
                </div>
            </div>
        </section>
      <footer className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 text-center text-muted-foreground">
        <p>&copy; {new Date().getFullYear()} NextStep. All rights reserved.</p>
      </footer>
    </div>
  );
}
