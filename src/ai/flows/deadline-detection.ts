// This file uses server-side code.
'use server';

/**
 * @fileOverview AI agent that automatically detects deadlines, appointments, and payment reminders from emails and documents.
 *
 * - detectDeadline - A function that handles the deadline detection process.
 * - DetectDeadlineInput - The input type for the detectDeadline function.
 * - DetectDeadlineOutput - The return type for the detectDeadline function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const DetectDeadlineInputSchema = z.object({
  text: z.string().describe('The text from which to detect deadlines, appointments, and payment reminders.'),
});
export type DetectDeadlineInput = z.infer<typeof DetectDeadlineInputSchema>;

const DetectDeadlineOutputSchema = z.object({
  shouldAdd: z.boolean().describe('Whether or not a deadline, appointment, or payment reminder was detected.'),
  title: z.string().optional().describe('The title of the deadline, appointment, or payment reminder.'),
  date: z.string().optional().describe('The date and time of the deadline, appointment, or payment reminder in ISO format (YYYY-MM-DDTHH:mm:ss.sssZ).'),
  category: z.string().optional().describe('The category of the deadline, appointment, or payment reminder (e.g., assignment, meeting, bill).'),
});
export type DetectDeadlineOutput = z.infer<typeof DetectDeadlineOutputSchema>;

export async function detectDeadline(input: DetectDeadlineInput): Promise<DetectDeadlineOutput> {
  return detectDeadlineFlow(input);
}

const prompt = ai.definePrompt({
  name: 'detectDeadlinePrompt',
  input: {schema: DetectDeadlineInputSchema},
  output: {schema: DetectDeadlineOutputSchema},
  prompt: `You are an AI assistant that analyzes text to detect deadlines, appointments, and payment reminders.

  Determine whether the provided text contains a deadline, appointment, or payment reminder. If so, extract the relevant information and populate the output fields. If not, set shouldAdd to false.

  When extracting the date, also extract the time if it's present and include it in the ISO format. If no time is specified, default to the beginning of the day (00:00:00).
  The current year is ${new Date().getFullYear()}.

  Text: {{{text}}}

  Respond in JSON format.
  `,
});

const detectDeadlineFlow = ai.defineFlow(
  {
    name: 'detectDeadlineFlow',
    inputSchema: DetectDeadlineInputSchema,
    outputSchema: DetectDeadlineOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
