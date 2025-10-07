'use client';
import { getApplicationById, updateApplication } from '@/lib/storage';
import { notFound } from 'next/navigation';
import PageHeader from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Briefcase,
  Calendar,
  Clock,
  ExternalLink,
  Link as LinkIcon,
  MapPin,
  DollarSign,
  Tag,
  PlusCircle,
  ChevronDown,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Application, ApplicationStatus, ApplicationEvent } from '@/lib/types';
import ApplicationTimeline from '@/components/applications/application-timeline';
import { useEffect, useState, use } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from '@/components/ui/dialog';
import AddEventForm from '@/components/applications/add-event-form';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';


const allStatuses: ApplicationStatus[] = [
    'APPLIED', 'VIEWED', 'PHONE_SCREEN', 'INTERVIEW', 'OFFER', 'REJECTED', 'WITHDRAWN'
];

const statusColors: Record<ApplicationStatus, string> = {
    APPLIED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-300',
    VIEWED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border-gray-300',
    PHONE_SCREEN: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-purple-300',
    INTERVIEW: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-300',
    OFFER: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300',
    REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300',
    WITHDRAWN: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200 border-pink-300',
};


export default function ApplicationDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [application, setApplication] = useState<Application | null | undefined>(undefined);
  const [isAddEventOpen, setIsAddEventOpen] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    async function loadApplication() {
        const app = await getApplicationById(id);
        setApplication(app);
    }
    loadApplication();
  }, [id]);

  const handleEventAdded = (newEvent: ApplicationEvent) => {
    setApplication(prev => {
        if (!prev) return null;
        return {
            ...prev,
            events: [...(prev.events || []), newEvent].sort((a,b) => new Date(b.occurredAt).getTime() - new Date(a.occurredAt).getTime()),
            updatedAt: new Date(), // optimistically update the timestamp
        }
    });
  }

  const handleStatusChange = async (newStatus: ApplicationStatus) => {
    if (!application || newStatus === application.status) return;

    // Optimistic update
    const originalStatus = application.status;
    setApplication(prev => prev ? { ...prev, status: newStatus, updatedAt: new Date() } : null);

    const success = await updateApplication(id, { status: newStatus });

    if (success) {
        toast({
            title: 'Status Updated',
            description: `Application status changed to ${newStatus.replace('_', ' ')}.`,
        });
    } else {
        // Revert on failure
        setApplication(prev => prev ? { ...prev, status: originalStatus } : null);
        toast({
            variant: 'destructive',
            title: 'Update Failed',
            description: 'Could not update the application status.',
        });
    }
  }


  if (application === undefined) {
    // Still loading
    return <div>Loading...</div>;
  }

  if (!application) {
    notFound();
  }

  const {
    title,
    companyName,
    status,
    appliedAt,
    updatedAt,
    sourceName,
    location,
    salary,
    url,
    tags,
    notes,
    events
  } = application;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title={title}
        description={`at ${companyName}`}
      >
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" className={`${statusColors[status]} text-sm`}>
                    {status.replace('_', ' ')}
                    <ChevronDown className="h-4 w-4 ml-2" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                {allStatuses.map(s => (
                    <DropdownMenuItem key={s} onSelect={() => handleStatusChange(s)} disabled={s === status}>
                        {s.replace('_', ' ')}
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
      </PageHeader>

      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <ApplicationTimeline events={events || []}>
                <Button variant="outline" size="sm" onClick={() => setIsAddEventOpen(true)}>
                    <PlusCircle className="h-4 w-4 mr-2"/>
                    Add Update
                </Button>
            </ApplicationTimeline>

            {notes && notes.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Notes</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <ul className="space-y-4">
                            {notes.map(note => (
                                <li key={note.id} className="text-sm text-muted-foreground">
                                    <p className="text-foreground">{note.text}</p>
                                    <span className="text-xs">{format(note.createdAt, 'PPP')}</span>
                                </li>
                            ))}
                        </ul>
                    </CardContent>
                </Card>
            )}
        </div>

        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Details</CardTitle>
            </CardHeader>
            <CardContent className="grid gap-4 text-sm">
                <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Applied on {format(appliedAt, 'PPP')}</span>
                </div>
                <div className="flex items-center">
                    <Clock className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Last updated {formatDistanceToNow(updatedAt, { addSuffix: true })}</span>
                </div>
                <div className="flex items-center">
                    <Briefcase className="h-4 w-4 mr-2 text-muted-foreground" />
                    <span>Source: {sourceName}</span>
                </div>
                {location && (
                    <div className="flex items-center">
                        <MapPin className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{location}</span>
                    </div>
                )}
                {salary && (
                    <div className="flex items-center">
                        <DollarSign className="h-4 w-4 mr-2 text-muted-foreground" />
                        <span>{salary}</span>
                    </div>
                )}
                {url && (
                    <div className="flex items-center">
                        <LinkIcon className="h-4 w-4 mr-2 text-muted-foreground" />
                        <a href={url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline truncate">
                            {url} <ExternalLink className="inline-block h-3 w-3 ml-1" />
                        </a>
                    </div>
                )}
                {tags && tags.length > 0 && (
                    <div className="flex items-start">
                        <Tag className="h-4 w-4 mr-2 mt-1 text-muted-foreground" />
                        <div className="flex flex-wrap gap-2">
                            {tags.map(tag => (
                                <Badge key={tag} variant="secondary">{tag}</Badge>
                            ))}
                        </div>
                    </div>
                )}
            </CardContent>
          </Card>
        </div>
      </main>
      <Dialog open={isAddEventOpen} onOpenChange={setIsAddEventOpen}>
        <DialogContent>
            <DialogHeader>
                <DialogTitle>Add a New Timeline Event</DialogTitle>
                <DialogDescription>
                    Log a new update for this application.
                </DialogDescription>
            </DialogHeader>
            <AddEventForm
                applicationId={id}
                onEventAdded={handleEventAdded}
                onFinished={() => setIsAddEventOpen(false)}
            />
        </DialogContent>
      </Dialog>
    </div>
  );
}
