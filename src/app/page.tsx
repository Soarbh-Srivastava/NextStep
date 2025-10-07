'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import KPICard from '@/components/dashboard/kpi-card';
import ApplicationsBySourceChart from '@/components/dashboard/applications-by-source-chart';
import FunnelChart from '@/components/dashboard/funnel-chart';
import WeeklyApplicationsChart from '@/components/dashboard/weekly-applications-chart';
import PageHeader from '@/components/layout/page-header';

import {
  analyticsData,
  funnelData,
  weeklyData,
} from '@/lib/data';
import { getApplications } from '@/lib/storage';
import { Activity, Briefcase, Target, Clock } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Application } from '@/lib/types';


export default function Dashboard() {
  const [applications, setApplications] = useState<Application[]>([]);

  useEffect(() => {
    setApplications(getApplications());
  }, []);

  const totalApplications = applications.length;
  const totalOffers = applications.filter(
    (app) => app.status === 'OFFER'
  ).length;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Dashboard"
        description="Here's your job application overview."
      />
      <main className="grid flex-1 items-start gap-4 p-4 sm:px-6 sm:py-0 md:gap-8 lg:grid-cols-3 xl:grid-cols-3">
        <div className="grid auto-rows-max items-start gap-4 md:gap-8 lg:col-span-3">
          <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4">
            <KPICard
              title="Total Applications"
              value={totalApplications}
              icon={<Briefcase className="h-4 w-4 text-muted-foreground" />}
            />
            <KPICard
              title="Offers Received"
              value={totalOffers}
              icon={<Target className="h-4 w-4 text-muted-foreground" />}
              change={
                totalApplications > 0
                  ? `${((totalOffers / totalApplications) * 100).toFixed(1)}%`
                  : '0%'
              }
              changeDescription="Offer rate"
            />
            <KPICard
              title="Avg. Time to Response"
              value={`${analyticsData.avgHoursToFirstResponse.toFixed(1)} hrs`}
              icon={<Clock className="h-4 w-4 text-muted-foreground" />}
            />
            <KPICard
              title="Active Applications"
              value={
                applications.filter(
                  (app) =>
                    !['OFFER', 'REJECTED', 'WITHDRAWN'].includes(app.status)
                ).length
              }
              icon={<Activity className="h-4 w-4 text-muted-foreground" />}
            />
          </div>
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
            <Card className="col-span-1 lg:col-span-4">
              <CardHeader>
                <CardTitle>Applications per Week</CardTitle>
                <CardDescription>
                  A look at your application activity over time.
                </CardDescription>
              </CardHeader>
              <CardContent className="pl-2">
                <WeeklyApplicationsChart data={weeklyData} />
              </CardContent>
            </Card>
            <Card className="col-span-1 lg:col-span-3">
              <CardHeader>
                <CardTitle>Applications by Source</CardTitle>
                <CardDescription>
                  Where are your applications coming from?
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ApplicationsBySourceChart data={analyticsData.applicationsBySource} />
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle>Application Funnel</CardTitle>
              <CardDescription>
                Your progress from application to offer.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FunnelChart data={funnelData} />
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
