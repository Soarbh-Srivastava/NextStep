import PageHeader from '@/components/layout/page-header';
import ApplicationForm from '@/components/applications/application-form';
import { Card, CardContent } from '@/components/ui/card';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JobTrack - New Application',
};

export default function NewApplicationPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="New Application"
        description="Add a new job application to your tracker."
      />
      <main className="p-4 sm:px-6 sm:py-0">
        <Card>
          <CardContent className="p-6">
            <ApplicationForm />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
