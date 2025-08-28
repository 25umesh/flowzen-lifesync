'use server';

/**
 * @fileOverview A flow for sending email notifications.
 *
 * This flow uses Nodemailer to send emails via a configured Gmail account.
 * Ensure that EMAIL_USER, EMAIL_PASS, and EMAIL_FROM are set in your environment variables.
 *
 * - sendEmail - A function that handles sending the email.
 * - SendEmailInput - The input type for the sendEmail function.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import nodemailer from 'nodemailer';

const SendEmailInputSchema = z.object({
  to: z.string().email().describe("The recipient's email address."),
  subject: z.string().describe('The subject of the email.'),
  body: z.string().describe('The content of the email message.'),
});
export type SendEmailInput = z.infer<typeof SendEmailInputSchema>;

export async function sendEmail(input: SendEmailInput): Promise<{ success: boolean; message: string }> {
  return sendEmailFlow(input);
}

const sendEmailFlow = ai.defineFlow(
  {
    name: 'sendEmailFlow',
    inputSchema: SendEmailInputSchema,
    outputSchema: z.object({
        success: z.boolean(),
        message: z.string(),
    }),
  },
  async (input) => {
    // Ensure environment variables are set
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS || !process.env.EMAIL_FROM) {
        const errorMessage = "Email environment variables (EMAIL_USER, EMAIL_PASS, EMAIL_FROM) are not configured.";
        console.error(errorMessage);
        return { success: false, message: errorMessage };
    }
    
    // Configure the email transporter using Nodemailer
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // Use an "App Password" for Gmail
      },
    });

    try {
      // Send the email
      await transporter.sendMail({
        from: `FlowZen <${process.env.EMAIL_FROM}>`,
        to: input.to,
        subject: input.subject,
        html: input.body,
      });

      const successMessage = `Email sent successfully to ${input.to}.`;
      console.log(successMessage);
      return { success: true, message: successMessage };

    } catch (error) {
      console.error('Failed to send email:', error);
      // It's good practice to not expose detailed error info to the client.
      return { success: false, message: 'An error occurred while trying to send the email.' };
    }
  }
);
