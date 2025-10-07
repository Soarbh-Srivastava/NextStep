'use client';
import { useEffect, useState, useMemo } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getApplicationsList } from '@/lib/storage';
import { Application, ApplicationEvent } from '@/lib/types';
import PageHeader from '@/components/layout/page-header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';
import { format } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import Link from 'next/link';

type AugmentedEvent = ApplicationEvent & {
    applicationTitle: string;
    companyName: string;
};

export default function CalendarPage() {
    const { user } = useAuth();
    const [events, setEvents] = useState<AugmentedEvent[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadEvents() {
            if (!user) return;
            setLoading(true);

            // This is not ideal as it fetches all applications and then all sub-collections
            // A more optimized approach would be a dedicated query if performance becomes an issue
            const apps = await getApplicationsList(user.uid);
            
            // This is a simplified fetch, we don't have a getApplicationById that includes events
            // We'll need to modify the data fetching logic or accept this limitation for now
            // For this implementation, let's assume events are part of the list for simplicity
            // NOTE: getApplicationsList does not return events. This will be an empty page.
            // I need to fetch each application's events separately.
            
            // Re-fetching full application data is necessary as getApplicationsList is shallow
            const { getApplicationById } = await import('@/lib/storage');
            const fullApps = await Promise.all(apps.map(app => getApplicationById(app.id)));

            const allEvents = fullApps.flatMap(app => {
                if (!app || !app.events) return [];
                return app.events.map(event => ({
                    ...event,
                    applicationId: app.id,
                    applicationTitle: app.title,
                    companyName: app.companyName,
                }));
            });

            setEvents(allEvents.sort((a,b) => new Date(a.occurredAt).getTime() - new Date(b.occurredAt).getTime()));
            setLoading(false);
        }
        loadEvents();
    }, [user]);

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
