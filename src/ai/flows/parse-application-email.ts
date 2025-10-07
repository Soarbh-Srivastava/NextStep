'use server';

/**
 * @fileOverview This flow parses job application details from forwarded emails.
 *
 * - parseApplicationEmail - A function that handles the email parsing process.
 * - ParseApplicationEmailInput - The input type for the parseApplicationEmail function.
 * - ParseApplicationEmailOutput - The return type for the parseApplicationEmail function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ParseApplicationEmailInputSchema = z.object({
  rawText: z.string().describe('The raw text content of the forwarded email.'),
});
export type ParseApplicationEmailInput = z.infer<typeof ParseApplicationEmailInputSchema>;

const ParseApplicationEmailOutputSchema = z.object({
  company: z.string().describe('The name of the company.'),
  title: z.string().describe('The job title.'),
  appliedAt: z.string().describe('The date when the application was submitted (ISO format).'),
  url: z.string().optional().describe('The URL of the job application, if available.'),
  applicationId: z.string().optional().describe('The unique identifier of the application, if available.'),
});
export type ParseApplicationEmailOutput = z.infer<typeof ParseApplicationEmailOutputSchema>;

export async function parseApplicationEmail(input: ParseApplicationEmailInput): Promise<ParseApplicationEmailOutput> {
  return parseApplicationEmailFlow(input);
}

const parseEmailPrompt = ai.definePrompt({
  name: 'parseEmailPrompt',
  input: {schema: ParseApplicationEmailInputSchema},
  output: {schema: ParseApplicationEmailOutputSchema},
  prompt: `You are an expert at extracting job application details from email text.

  Your goal is to extract the company name, job title, application date, and application URL from the provided email text.
  If a piece of information isn't found, leave it blank, do not guess.

  Return the information as a JSON object with the following keys:
  - company (string): The name of the company.
  - title (string): The job title.
  - appliedAt (string): The date when the application was submitted (ISO format).
  - url (string, optional): The URL of the job application, if available.
  - applicationId (string, optional): The unique identifier of the application, if available.

  Here is the email text:
  {{rawText}}
  `,
});

const parseApplicationEmailFlow = ai.defineFlow(
  {
    name: 'parseApplicationEmailFlow',
    inputSchema: ParseApplicationEmailInputSchema,
    outputSchema: ParseApplicationEmailOutputSchema,
  },
  async input => {
    const {output} = await parseEmailPrompt(input);
    return output!;
  }
);
