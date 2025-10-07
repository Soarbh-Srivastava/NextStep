import { ApplicationEvent } from "@/lib/types";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle, Circle, Briefcase, Phone, Users, Award, XCircle, Mail, MessageSquare, Laptop, Code, UserCheck, CalendarPlus } from "lucide-react";
import { format, formatISO } from "date-fns";
import { Button } from "../ui/button";

type TimelineProps = {
    events: ApplicationEvent[];
    children?: React.ReactNode;
}

const eventIcons: Record<string, React.ReactNode> = {
    applied: <Briefcase className="h-5 w-5" />,
    viewed: <CheckCircle className="h-5 w-5 text-blue-500" />,
    first_response: <Mail className="h-5 w-5 text-green-500" />,
    followed_up: <MessageSquare className="h-5 w-5" />,
    phone_screen_scheduled: <Phone className="h-5 w-5" />,
    online_assessment: <Laptop className="h-5 w-5" />,
    technical_interview: <Code className="h-5 w-5" />,
    hr_interview: <UserCheck className="h-5 w-5" />,
    interview_scheduled: <Users className="h-5 w-5" />,
    offer: <Award className="h-5 w-5 text-yellow-500" />,
    rejected: <XCircle className="h-5 w-5 text-red-500" />,
    withdrawn: <XCircle className="h-5 w-5 text-pink-500" />,
};

const getEventTitle = (type: string) => {
    return type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
}

// Helper to create Google Calendar link
const createGoogleCalendarLink = (event: ApplicationEvent, title: string) => {
    const startTime = new Date(event.occurredAt);
    const endTime = new Date(startTime.getTime() + 60 * 60 * 1000); // Assume 1 hour duration

    const formatForGoogle = (date: Date) => {
        return formatISO(date, { format: 'basic' }).replace(/-|:|\.\d{3}/g, '');
    };

    const params = new URLSearchParams({
        action: 'TEMPLATE',
        text: `${getEventTitle(event.type)}: ${title}`,
        dates: `${formatForGoogle(startTime)}/${formatForGoogle(endTime)}`,
        details: event.metadata?.note || `Job application event for ${title}.`,
    });

    if (event.metadata?.location) {
        params.append('location', event.metadata.location);
    }

    return `https://www.google.com/calendar/render?${params.toString()}`;
};


export default function ApplicationTimeline({ events, children }: TimelineProps) {
    const sortedEvents = [...events].sort((a, b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime());

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Application Timeline</CardTitle>
                    <CardDescription>A chronological history of events for this application.</CardDescription>
                </div>
                {children}
            </CardHeader>
            <CardContent>
                 {sortedEvents.length > 0 ? (
                    <div className="relative pl-6">
                        <div className="absolute left-[35px] top-0 bottom-0 w-0.5 bg-border -translate-x-1/2"></div>
                        {sortedEvents.map((event, index) => (
                            <div key={event.id} className="relative flex items-start gap-6 pb-8">
                                <div className="relative z-10 flex h-10 w-10 items-center justify-center rounded-full bg-background border-2 border-primary">
                                    {eventIcons[event.type] || <Circle className="h-5 w-5" />}
                                </div>
                                <div className="grid gap-1 pt-1.5 flex-1">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-semibold">{getEventTitle(event.type)}</h3>
                                            <time className="text-sm text-muted-foreground">{format(event.occurredAt, 'PPP p')}</time>
                                        </div>
                                        <Button asChild variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                                            <a href={createGoogleCalendarLink(event, 'Application')} target="_blank" rel="noopener noreferrer" title="Add to Google Calendar">
                                                <CalendarPlus className="h-4 w-4 text-muted-foreground"/>
                                            </a>
                                        </Button>
                                    </div>
                                    {event.metadata?.note && <p className="text-sm text-muted-foreground">{event.metadata.note}</p>}
                                    {event.metadata?.with && <p className="text-sm text-muted-foreground">With: {event.metadata.with}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="text-center text-muted-foreground py-8">
                        No events have been logged for this application yet.
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
