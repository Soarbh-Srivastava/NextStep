import PageHeader from '@/components/layout/page-header';
import EmailParser from '@/components/email-parser';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JobTrack - Parse Email',
};

export default function ParseEmailPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Parse Email"
        description="Paste a forwarded email to automatically create an application."
      />
      <main className="p-4 sm:px-6 sm:py-0">
        <Card>
          <CardHeader>
            <CardTitle>Email Content</CardTitle>
            <CardDescription>
              Forward an application confirmation email from your inbox and paste the entire content below. Our AI will do its best to extract the details.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmailParser />
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
