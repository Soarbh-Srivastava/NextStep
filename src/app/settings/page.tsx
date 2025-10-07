import PageHeader from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'JobTrack - Settings',
};

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Settings"
        description="Manage your account settings and integrations."
      />
      <main className="p-4 sm:px-6 sm:py-0">
        <Card>
            <CardHeader>
                <CardTitle>Coming Soon</CardTitle>
                <CardDescription>This section is under construction. Soon you'll be able to manage your profile, notifications, and connect external services.</CardDescription>
            </CardHeader>
            <CardContent>
                <p>Future features will include:</p>
                <ul className="list-disc list-inside text-muted-foreground mt-2">
                    <li>User profile management</li>
                    <li>Email notification preferences</li>
                    <li>Calendar integration settings</li>
                    <li>API keys for third-party services</li>
                </ul>
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
