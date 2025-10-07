'use client';
import PageHeader from '@/components/layout/page-header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import type { Metadata } from 'next';
import ProfileForm from '@/components/settings/profile-form';

// Metadata is now client-side, so we remove the export
// export const metadata: Metadata = {
//   title: 'JobTrack - Settings',
// };

export default function SettingsPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Settings"
        description="Manage your account settings."
      />
      <main className="p-4 sm:px-6 sm:py-0">
        <Card>
            <CardHeader>
                <CardTitle>User Profile</CardTitle>
                <CardDescription>Update your display name and view your account details.</CardDescription>
            </CardHeader>
            <CardContent>
                <ProfileForm />
            </CardContent>
        </Card>
      </main>
    </div>
  );
}
