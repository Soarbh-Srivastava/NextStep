'use client';
import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getApplicationsList, deleteApplicationEvent } from '@/lib/storage';
import { Application, ApplicationEvent } from '@/lib/types';
import PageHeader from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { CalendarPlus, Loader2, Trash2 } from 'lucide-react';
import { format, formatISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import Link from 'next/link';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';

type AugmentedEvent = ApplicationEvent & {
    applicationTitle: string;
    companyName: string;
    location?: string;
};

// Helper to create Google Calendar link
const createGoogleCalendarLink = (event: AugmentedEvent) => {
    const startTime = new Date(event.occurredAt);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Assume 1 hour duration

    const formatForGoogle = (date: Date) => {
        return formatISO(date, { format: 'basic' }).replace(/-|:|\.\d{3}/g, '');
    };

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: `${event.type.replace(/_/g, ' ')}: ${event.applicationTitle} at ${event.companyName}`,
        dates: `${formatForGoogle(startTime)}/${formatForGoogle(endTime)}`,
        details: event.metadata?.note || `Job application event for ${event.applicationTitle}.`,
    });

    if (event.location) {
        params.append('location', event.location);
    }

    return `https://www.google.com/calendar/render?${params.toString()}`;
};


export default function CalendarPage() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [events, setEvents] = useState<AugmentedEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadEvents() {
            if (!user) return;
            setLoading(true);
            const apps = await getApplicationsList(user.uid);
            const { getApplicationById } = await import('@/lib/storage');
            const fullApps = await Promise.all(apps.map(app => getApplicationById(app.id)));

            const allEvents = fullApps.flatMap(app => {
                if (!app || !app.events) return [];
                return app.events.map(event => ({
                    ...event,
                    applicationId: app.id,
                    applicationTitle: app.title,
                    companyName: app.companyName,
                    location: app.location
                }));
            });

            setEvents(allEvents.sort((a,b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()));
            setLoading(false);
        }
        loadEvents();
    }, [user]);

    const handleDeleteEvent = async (applicationId: string, eventId: string) => {
        const originalEvents = [...events];
        setEvents(prev => prev.filter(e => e.id !== eventId));

        const success = await deleteApplicationEvent(applicationId, eventId);
        if (success) {
            toast({
                title: 'Event Deleted',
                description: 'The event has been removed from your calendar.',
            });
        } else {
            setEvents(originalEvents);
            toast({
                variant: 'destructive',
                title: 'Deletion Failed',
                description: 'Could not delete the event. Please try again.',
            });
        }
    };


    const groupedEvents = useMemo(() => {
        const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
        
        return events.reduce((acc, event) => {
            const zonedDate = toZonedTime(event.occurredAt, timeZone);
            const day = format(zonedDate, 'yyyy-MM-dd');
            if (!acc[day]) {
                acc[day] = [];
            }
            acc[day].push(event);
            return acc;
        }, {} as Record<string, AugmentedEvent[]>);
    }, [events]);

    const sortedDays = Object.keys(groupedEvents).sort();

    if (loading) {
        return (
            <div className="flex flex-col gap-4">
                <PageHeader title="Calendar" description="Your upcoming application events." />
                <div className="flex justify-center items-center h-64">
                    <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    <p className="ml-2">Loading calendar...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="flex flex-col gap-4">
            <PageHeader title="Calendar" description="Your upcoming application events." />
            <main className="p-4 sm:px-6 sm:py-0">
                {sortedDays.length > 0 ? (
                     <div className="space-y-6">
                        {sortedDays.map(day => (
                            <div key={day}>
                                <h2 className="font-bold text-lg mb-2 sticky top-0 bg-background/80 backdrop-blur-sm py-2 border-b">
                                    {format(new Date(day), 'EEEE, MMMM d, yyyy')}
                                </h2>
                                <div className="space-y-4">
                                    {groupedEvents[day].map(event => (
                                        <Card key={event.id}>
                                            <CardHeader className="p-4">
                                                <div className="flex items-start justify-between">
                                                    <div>
                                                        <p className="text-sm text-muted-foreground">{format(event.occurredAt, 'p')}</p>
                                                        <CardTitle className="text-base font-semibold">
                                                            {event.type.split('_').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')}
                                                        </CardTitle>
                                                        <p className="text-sm font-medium">
                                                            <Link href={`/applications/${event.applicationId}`} className="text-primary hover:underline">
                                                                {event.applicationTitle} at {event.companyName}
                                                            </Link>
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2">
                                                        <Button asChild variant="outline" size="sm">
                                                            <a href={createGoogleCalendarLink(event)} target="_blank" rel="noopener noreferrer">
                                                                <CalendarPlus className="mr-2 h-4 w-4"/>
                                                                Add to Calendar
                                                            </a>
                                                        </Button>
                                                        <AlertDialog>
                                                          <AlertDialogTrigger asChild>
                                                              <Button variant="ghost" size="icon" className="h-9 w-9 text-muted-foreground hover:text-destructive">
                                                                  <Trash2 className="h-4 w-4" />
                                                                  <span className="sr-only">Delete Event</span>
                                                              </Button>
                                                          </AlertDialogTrigger>
                                                          <AlertDialogContent>
                                                            <AlertDialogHeader>
                                                              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
                                                              <AlertDialogDescription>
                                                                This will permanently delete this event. This action cannot be undone.
                                                              </AlertDialogDescription>
                                                            </AlertDialogHeader>
                                                            <AlertDialogFooter>
                                                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                                                              <AlertDialogAction onClick={() => handleDeleteEvent(event.applicationId, event.id)}>
                                                                Delete
                                                              </AlertDialogAction>
                                                            </AlertDialogFooter>
                                                          </AlertDialogContent>
                                                        </AlertDialog>
                                                    </div>
                                                </div>
                                            </CardHeader>
                                            {event.metadata?.note && (
                                                <CardContent className="p-4 pt-0">
                                                    <p className="text-sm text-muted-foreground">{event.metadata.note}</p>
                                                </CardContent>
                                            )}
                                        </Card>
                                    ))}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-16">
                        <p>No upcoming events found.</p>
                        <p className="text-sm">Events you add to your applications will appear here.</p>
                    </div>
                )}
            </main>
        </div>
    );
}