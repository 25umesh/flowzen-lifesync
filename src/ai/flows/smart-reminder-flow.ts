'use server';
/**
 * @fileOverview AI agent that suggests optimal reminder times.
 *
 * - suggestReminders - A function that suggests reminder timings.
 * - SuggestRemindersInput - The input type for the suggestReminders function.
 * - SuggestRemindersOutput - The return type for the suggestReminders function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestRemindersInputSchema = z.object({
  title: z.string().describe('The title of the event or task.'),
  date: z.string().describe('The due date and time of the event in ISO format.'),
});
export type SuggestRemindersInput = z.infer<typeof SuggestRemindersInputSchema>;

const ReminderSchema = z.object({
    value: z.number().describe('The numerical value of the reminder interval.'),
    unit: z.enum(['minutes', 'hours', 'days']).describe('The unit of the reminder interval.'),
});

const SuggestRemindersOutputSchema = z.object({
  reminders: z.array(ReminderSchema).describe('A list of suggested reminder intervals.'),
});
export type SuggestRemindersOutput = z.infer<typeof SuggestRemindersOutputSchema>;

export async function suggestReminders(input: SuggestRemindersInput): Promise<SuggestRemindersOutput> {
  return suggestRemindersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestRemindersPrompt',
  input: {schema: SuggestRemindersInputSchema},
  output: {schema: SuggestRemindersOutputSchema},
  prompt: `You are an AI assistant that suggests optimal reminder times for tasks and events.

  Based on the title and due date, determine the importance and nature of the item.
  - For critical items like 'Exam' or 'Project Deadline', suggest multiple reminders (e.g., 1 day before, 2 hours before).
  - For less critical items like 'Meeting', a single reminder (e.g., 30 minutes before) might be sufficient.
  - For bills, suggest a reminder a few days in advance.

  Always return at least one reminder. Limit the suggestions to a maximum of 3.

  Current time is ${new Date().toISOString()}.
  Task Title: {{{title}}}
  Due Date: {{{date}}}
  `,
});

const suggestRemindersFlow = ai.defineFlow(
  {
    name: 'suggestRemindersFlow',
    inputSchema: SuggestRemindersInputSchema,
    outputSchema: SuggestRemindersOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
