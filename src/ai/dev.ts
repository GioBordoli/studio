import { config } from 'dotenv';
config();

import '@/ai/flows/suggest-additional-questions.ts';
import '@/ai/flows/transcribe-audio.ts';
import '@/ai/flows/format-medical-document.ts';
import '@/ai/flows/identify-questions-and-answers.ts';