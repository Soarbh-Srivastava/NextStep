import PageHeader from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import ApplicationsTable from '@/components/applications/applications-table';
import { applications } from '@/lib/data';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JobTrack - Applications',
};

export default function ApplicationsPage() {
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
        <ApplicationsTable data={applications} />
      </main>
    </div>
  );
}
