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

import { getApplicationsList, getApplicationById } from '@/lib/storage';
import { Activity, Briefcase, Target, Clock, Loader2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Application, ApplicationStatus } from '@/lib/types';
import { eachDayOfInterval, startOfWeek, endOfWeek, format, differenceInHours } from 'date-fns';
import { useAuth } from '@/hooks/use-auth';

type ApplicationListItem = Omit<Application, 'notes' | 'events'>;

export default function Dashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState<ApplicationListItem[]>([]);
  const [fullApplications, setFullApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      if (!user) return;
      setLoading(true);
      const apps = await getApplicationsList(user.uid);
      setApplications(apps);

      // Fetch full details for calculations
      const fullApps = await Promise.all(apps.map(app => getApplicationById(app.id)));
      setFullApplications(fullApps.filter((app): app is Application => !!app));
      
      setLoading(false);
    }
    loadData();
  }, [user]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <p className="ml-2">Loading dashboard...</p>
      </div>
    );
  }

  const totalApplications = applications.length;
  const totalOffers = applications.filter(
    (app) => app.status === 'OFFER'
  ).length;

  const getStatusCount = (status: ApplicationStatus) => applications.filter(app => app.status === status).length;

  const applicationsBySource = applications.reduce((acc, app) => {
    const source = acc.find(s => s.source === app.sourceName);
    if (source) {
      source.count++;
    } else {
      acc.push({ source: app.sourceName, count: 1 });
    }
    return acc;
  }, [] as { source: string; count: number }[]);

  const funnelData = [
    { name: 'Applied', value: totalApplications, fill: 'hsl(var(--chart-1))' },
    { name: 'Response', value: applications.filter(app => app.status !== 'APPLIED' && app.status !== 'WITHDRAWN').length, fill: 'hsl(var(--chart-2))' },
    { name: 'Interview', value: applications.filter(app => ['PHONE_SCREEN', 'INTERVIEW', 'OFFER'].includes(app.status)).length, fill: 'hsl(var(--chart-3))' },
    { name: 'Offer', value: totalOffers, fill: 'hsl(var(--chart-4))' },
  ];

  const weeklyData = applications.reduce((acc, app) => {
      const weekStart = format(startOfWeek(app.appliedAt), 'yyyy-MM-dd');
      const weekData = acc.find(w => w.date === weekStart);
      if (weekData) {
        weekData.applications++;
      } else {
        acc.push({ date: weekStart, applications: 1 });
      }
      return acc;
    }, [] as { date: string, applications: number }[]).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());


  const firstResponseApplications = fullApplications.filter(app => {
    const firstResponseEvent = app.events?.find(e => e.type === 'first_response');
    return firstResponseEvent;
  });

  const avgHoursToFirstResponse = firstResponseApplications.length > 0 ? firstResponseApplications.reduce((totalHours, app) => {
      const appliedEvent = app.events?.find(e => e.type === 'applied');
      const firstResponseEvent = app.events?.find(e => e.type === 'first_response');
      if (appliedEvent && firstResponseEvent) {
          return totalHours + differenceInHours(firstResponseEvent.occurredAt, appliedEvent.occurredAt);
      }
      return totalHours;
  }, 0) / firstResponseApplications.length : 0;


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
              value={`${avgHoursToFirstResponse.toFixed(1)} hrs`}
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
                <ApplicationsBySourceChart data={applicationsBySource} />
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
