'use server';

import { detectDeadline, type DetectDeadlineOutput } from '@/ai/flows/deadline-detection';
import { sendEmail } from '@/ai/flows/send-email-flow';
import { generateSchedule, GenerateScheduleOutput } from '@/ai/flows/smart-schedule-flow';
import { suggestReminders, SuggestRemindersOutput } from '@/ai/flows/smart-reminder-flow';
import type { FlowZenItem, Reminder } from '@/lib/types';
import { format } from 'date-fns';
import { ZodError } from 'zod';

type ActionResponse<T> = {
  success: boolean;
  data?: T;
  error?: string;
  issues?: string[];
}

export async function runDeadlineDetector(text: string): Promise<ActionResponse<DetectDeadlineOutput>> {
  if (!text) {
    return { success: false, error: 'Text cannot be empty.' };
  }
  
  try {
    const result = await detectDeadline({ text });
    return { success: true, data: result };
  } catch (error) {
    console.error(error);
    if (error instanceof ZodError) {
      return { success: false, error: 'Validation error.', issues: error.errors.map(e => e.message) };
    }
    return { success: false, error: 'An unexpected error occurred during AI analysis.' };
  }
}

function formatReminders(reminders: Reminder[]): string {
    if (!reminders || reminders.length === 0) return 'No reminders set.';
    return '<ul>' + reminders.map(r => `<li>${r.value} ${r.unit} before</li>`).join('') + '</ul>';
}

export async function runSendConfirmationEmail(item: FlowZenItem): Promise<{success: boolean}> {
    if (!item.email || !item.reminders || item.reminders.length === 0) {
        return { success: false };
    }

    try {
        await sendEmail({
            to: item.email,
            subject: `Reminder Set for: ${item.title}`,
            body: `
                <p>Hi there,</p>
                <p>This is a confirmation that you've set reminders for the following item:</p>
                <p><b>Title:</b> ${item.title}</p>
                <p><b>Date:</b> ${format(item.date, 'PPP p')}</p>
                <p>You will be notified at the following times:</p>
                ${formatReminders(item.reminders)}
                <p>Regards,<br/>FlowZen</p>
            `,
        });
        return { success: true };
    } catch (error) {
        console.error("Failed to send confirmation email", error);
        return { success: false };
    }
}

export async function runSmartSchedule(query: string): Promise<ActionResponse<GenerateScheduleOutput>> {
    if (!query) {
        return { success: false, error: "Query cannot be empty." };
    }

    try {
        const result = await generateSchedule({ query });
        return { success: true, data: result };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'An unexpected error occurred while generating the schedule.' };
    }
}

export async function runSmartReminder(title: string, date: Date): Promise<ActionResponse<SuggestRemindersOutput>> {
    if (!title || !date) {
        return { success: false, error: "Title and date are required." };
    }
    
    try {
        const result = await suggestReminders({ title, date: date.toISOString() });
        return { success: true, data: result };
    } catch (error) {
        console.error(error);
        return { success: false, error: 'An unexpected error occurred while suggesting reminders.' };
    }
}
