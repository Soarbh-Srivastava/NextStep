'use server';

/**
 * @fileOverview An AI agent to generate SQL queries for analytics.
 *
 * - generateAnalyticsSQL - A function that generates SQL queries for analytics.
 * - GenerateAnalyticsSQLInput - The input type for the generateAnalyticsSQL function.
 * - GenerateAnalyticsSQLOutput - The return type for the generateAnalyticsSQL function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateAnalyticsSQLInputSchema = z.object({
  tableName: z.string().describe('The name of the main table (e.g., \'Application\').'),
  userIdField: z.string().describe('The field name for the user ID (e.g., \'userId\').'),
  sourceNameField: z.string().describe('The field name for the source (e.g., \'sourceName\').'),
  statusField: z.string().describe('The field name for the status (e.g., \'status\').'),
  appliedAtField: z.string().describe('The field name for the application date (e.g., \'appliedAt\').'),
  firstResponseEventName: z.string().describe('The event name for the first response (e.g., \'first_response\').'),
  applicationEventTable: z.string().describe('The name of the application event table (e.g., \'ApplicationEvent\').'),
  applicationIdField: z.string().describe('The field name for the application ID in the event table (e.g., \'applicationId\').'),
  occurredAtField: z.string().describe('The field name for the event occurrence date (e.g., \'occurredAt\').'),
  eventTypeField: z.string().describe('The field name for the event type (e.g., \'type\').'),
});

export type GenerateAnalyticsSQLInput = z.infer<typeof GenerateAnalyticsSQLInputSchema>;

const GenerateAnalyticsSQLOutputSchema = z.object({
  applicationsBySource: z.string().describe('SQL query for applications by source.'),
  funnelCounts: z.string().describe('SQL query for funnel counts.'),
  avgTimeToFirstResponse: z.string().describe('SQL query for average time to first response.'),
  applicationsPerWeek: z.string().describe('SQL query for applications per week.'),
});

export type GenerateAnalyticsSQLOutput = z.infer<typeof GenerateAnalyticsSQLOutputSchema>;

export async function generateAnalyticsSQL(input: GenerateAnalyticsSQLInput): Promise<GenerateAnalyticsSQLOutput> {
  return generateAnalyticsSQLFlow(input);
}

const prompt = ai.definePrompt({
  name: 'analyticsSQLPrompt',
  input: {schema: GenerateAnalyticsSQLInputSchema},
  output: {schema: GenerateAnalyticsSQLOutputSchema},
  prompt: `You are an expert SQL query generator specializing in creating analytics queries for a job application tracker.

  Given the following table and field names, generate SQL queries for the following metrics:

  Table Name: {{{tableName}}}
  User ID Field: {{{userIdField}}}
  Source Name Field: {{{sourceNameField}}}
  Status Field: {{{statusField}}}
  Applied At Field: {{{appliedAtField}}}
  Application Event Table: {{{applicationEventTable}}}
  Application ID Field: {{{applicationIdField}}}
  Occurred At Field: {{{occurredAtField}}}
  Event Type Field: {{{eventTypeField}}}
  First Response Event Name: {{{firstResponseEventName}}}

  Queries:
  1. Applications by source:
  2. Funnel counts (applied, viewed, interview, offer):
  3. Average time to first response:
  4. Applications per week:

  Return the SQL queries in a JSON format like this:
  {
  "applicationsBySource": "SQL QUERY",
  "funnelCounts": "SQL QUERY",
  "avgTimeToFirstResponse": "SQL QUERY",
  "applicationsPerWeek": "SQL QUERY"
  }
  `,
});

const generateAnalyticsSQLFlow = ai.defineFlow(
  {
    name: 'generateAnalyticsSQLFlow',
    inputSchema: GenerateAnalyticsSQLInputSchema,
    outputSchema: GenerateAnalyticsSQLOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
