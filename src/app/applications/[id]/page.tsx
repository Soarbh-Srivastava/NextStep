'use client';
import { getApplicationById } from '@/lib/storage';
import { notFound } from 'next/navigation';
import PageHeader from '@/components/layout/page-header';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Briefcase,
  Calendar,
  Clock,
  ExternalLink,
  Link as LinkIcon,
  MapPin,
  DollarSign,
  Tag,
} from 'lucide-react';
import { format, formatDistanceToNow } from 'date-fns';
import { Application, ApplicationStatus } from '@/lib/types';
import ApplicationTimeline from '@/components/applications/application-timeline';
import { useEffect, useState } from 'react';

const statusColors: Record<ApplicationStatus, string> = {
    APPLIED: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-300',
    VIEWED: 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200 border-gray-300',
    PHONE_SCREEN: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200 border-purple-300',
    INTERVIEW: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200 border-yellow-300',
    OFFER: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 border-green-300',
    REJECTED: 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 border-red-300',
    WITHDRAWN: 'bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-200 border-pink-300',
};


export default function ApplicationDetailPage({ params }: { params: { id: string } }) {
  const id = params.id;
  const [application, setApplication] = useState<Application | null | undefined>(undefined);

  useEffect(() => {
    const app = getApplicationById(id);
    setApplication(app);
  }, [id]);


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
        <Badge className={`${statusColors[status]} text-sm`}>{status.replace('_', ' ')}</Badge>
      </PageHeader>

      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-2">
            <ApplicationTimeline events={events} />

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
    </div>
  );
}
