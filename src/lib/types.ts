export type ApplicationStatus =
  | 'APPLIED'
  | 'VIEWED'
  | 'PHONE_SCREEN'
  | 'INTERVIEW'
  | 'OFFER'
  | 'REJECTED'
  | 'WITHDRAWN';

export type ApplicationEvent = {
  id: string;
  applicationId: string;
  type: string;
  metadata?: Record<string, any>;
  occurredAt: Date;
};

export type Note = {
  id: string;
  applicationId: string;
  text: string;
  createdAt: Date;
};

export type Application = {
  id: string;
  userId: string;
  companyName: string;
  title: string;
  sourceName: string;
  appliedAt: Date;
  status: ApplicationStatus;
  jobId?: string;
  sourceId?: string;
  salary?: string;
  location?: string;
  resumeId?: string;
  coverLetter?: string;
  url?: string;
  notes: Note[];
  events: ApplicationEvent[];
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
};

export type AnalyticsData = {
    applicationsBySource: { source: string; count: number }[];
    funnel: {
        applied: number;
        viewed: number;
        interview: number;
        offer: number;
    };
    avgHoursToFirstResponse: number;
    weeklySeries: { week: string; count: number }[];
}
