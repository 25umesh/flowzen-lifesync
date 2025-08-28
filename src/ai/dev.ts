import { config } from 'dotenv';
config();

import '@/ai/flows/deadline-detection.ts';
import '@/ai/flows/send-email-flow.ts';
import '@/ai/flows/smart-schedule-flow.ts';
import '@/ai/flows/smart-reminder-flow.ts';
