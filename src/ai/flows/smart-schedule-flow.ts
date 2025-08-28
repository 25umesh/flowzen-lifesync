'use server';
/**
 * @fileOverview AI agent that creates an optimized study schedule.
 *
 * - generateSchedule - A function that handles the schedule generation process.
 * - GenerateScheduleInput - The input type for the generateSchedule function.
 * - GenerateScheduleOutput - The return type for the generateSchedule function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateScheduleInputSchema = z.object({
  query: z.string().describe('The user\'s request for a study schedule, including assignments, deadlines, and available time.'),
});
export type GenerateScheduleInput = z.infer<typeof GenerateScheduleInputSchema>;

const GenerateScheduleOutputSchema = z.object({
  schedule: z.string().describe('An optimized study schedule in HTML format, using lists and bold text for clarity.'),
});
export type GenerateScheduleOutput = z.infer<typeof GenerateScheduleOutputSchema>;

export async function generateSchedule(input: GenerateScheduleInput): Promise<GenerateScheduleOutput> {
  return generateScheduleFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateSchedulePrompt',
  input: {schema: GenerateScheduleInputSchema},
  output: {schema: GenerateScheduleOutputSchema},
  prompt: `You are an AI assistant that creates optimized study schedules for students.

  Based on the user's input about their assignments, deadlines, and available study time, generate a clear, actionable study plan.

  Prioritize tasks based on urgency and importance. Break down larger tasks into smaller steps.

  Format the output as a simple HTML block. Use <ul>, <li>, and <b> tags to structure the schedule. Do not include any other HTML tags like <html>, <body>, or <head>.

  User's Request: {{{query}}}
  
  The current date is ${new Date().toDateString()}.
  `,
});

const generateScheduleFlow = ai.defineFlow(
  {
    name: 'generateScheduleFlow',
    inputSchema: GenerateScheduleInputSchema,
    outputSchema: GenerateScheduleOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
