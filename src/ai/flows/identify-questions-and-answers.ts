'use server';
/**
 * @fileOverview Identifies questions and answers from a transcription and categorizes them.
 *
 * - identifyQuestionsAndAnswers - A function that identifies and categorizes questions and answers from a transcription.
 * - IdentifyQuestionsAndAnswersInput - The input type for the identifyQuestionsAndAnswers function.
 * - IdentifyQuestionsAndAnswersOutput - The return type for the identifyQuestionsAndAnswers function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const IdentifyQuestionsAndAnswersInputSchema = z.object({
  transcription: z.string().describe('The transcription of the conversation.'),
});
export type IdentifyQuestionsAndAnswersInput = z.infer<typeof IdentifyQuestionsAndAnswersInputSchema>;

const QuestionAnswerPairSchema = z.object({
  question: z.string().describe('The identified question.'),
  answer: z.string().describe('The identified answer.'),
  category: z.string().describe('The category of the question (e.g., medical history, symptoms).'),
});

const IdentifyQuestionsAndAnswersOutputSchema = z.array(QuestionAnswerPairSchema).describe('An array of question-answer pairs with their categories.');
export type IdentifyQuestionsAndAnswersOutput = z.infer<typeof IdentifyQuestionsAndAnswersOutputSchema>;

export async function identifyQuestionsAndAnswers(input: IdentifyQuestionsAndAnswersInput): Promise<IdentifyQuestionsAndAnswersOutput> {
  return identifyQuestionsAndAnswersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyQuestionsAndAnswersPrompt',
  input: {schema: IdentifyQuestionsAndAnswersInputSchema},
  output: {schema: IdentifyQuestionsAndAnswersOutputSchema},
  prompt: `You are an AI expert in medical anamnesis. Your task is to analyze the given transcription of a doctor-patient conversation and identify the questions asked by the doctor and the corresponding answers given by the patient. Categorize each question-answer pair into relevant medical screening sections (e.g., medical history, current symptoms, allergies, medications, family history, social history). Return a JSON array of question-answer pairs, each including the question, the answer, and the determined category. Ensure the JSON is valid and parsable.

Transcription:
{{{transcription}}}`,
});

const identifyQuestionsAndAnswersFlow = ai.defineFlow(
  {
    name: 'identifyQuestionsAndAnswersFlow',
    inputSchema: IdentifyQuestionsAndAnswersInputSchema,
    outputSchema: IdentifyQuestionsAndAnswersOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
