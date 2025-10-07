'use client';
import PageHeader from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import ApplicationsTable from '@/components/applications/applications-table';
import { deleteApplication, getApplicationsList } from '@/lib/storage';
import { useCallback, useEffect, useState } from 'react';
import { Application } from '@/lib/types';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';

export default function ApplicationsPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [applications, setApplications] = useState<Omit<Application, 'notes'|'events'>[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    if (!user) return;
    setLoading(true);
    const apps = await getApplicationsList(user.uid);
    setApplications(apps);
    setLoading(false);
  }, [user]);

  useEffect(() => {
    loadData();
  }, [loadData]);
  
  const handleDeleteApplication = async (applicationId: string) => {
    const success = await deleteApplication(applicationId);
    if (success) {
      toast({
        title: 'Application Deleted',
        description: 'The application has been successfully removed.',
      });
      // Refresh data
      loadData();
    } else {
      toast({
        variant: 'destructive',
        title: 'Deletion Failed',
        description: 'Could not delete the application. Please try again.',
      });
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Applications"
        description="Manage and track all your job applications."
      >
        <Button asChild>
          <Link href="/applications/new">
            <PlusCircle className="mr-2 h-4 w-4" />
            New Application
          </Link>
        </Button>
      </PageHeader>
      <main className="p-4 sm:px-6 sm:py-0">
        {loading ? <p>Loading applications...</p> : <ApplicationsTable data={applications} onDelete={handleDeleteApplication} />}
      </main>
    </div>
  );
}
