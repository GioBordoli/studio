'use server';

/**
 * @fileOverview Suggests additional questions based on identified gaps in the anamnesis.
 *
 * - suggestAdditionalQuestions - A function that suggests additional questions.
 * - SuggestAdditionalQuestionsInput - The input type for the suggestAdditionalQuestions function.
 * - SuggestAdditionalQuestionsOutput - The return type for the suggestAdditionalQuestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SuggestAdditionalQuestionsInputSchema = z.object({
  transcript: z
    .string()
    .describe('The current transcript of the anamnesis session.'),
  answeredQuestions: z
    .array(z.string())
    .describe('The list of questions already answered.'),
  screeningSection: z
    .string()
    .describe('The current screening section being addressed.'),
});
export type SuggestAdditionalQuestionsInput = z.infer<
  typeof SuggestAdditionalQuestionsInputSchema
>;

const SuggestAdditionalQuestionsOutputSchema = z.object({
  suggestedQuestions: z
    .array(z.string())
    .describe('The list of suggested questions to ask.'),
});
export type SuggestAdditionalQuestionsOutput = z.infer<
  typeof SuggestAdditionalQuestionsOutputSchema
>;

export async function suggestAdditionalQuestions(
  input: SuggestAdditionalQuestionsInput
): Promise<SuggestAdditionalQuestionsOutput> {
  return suggestAdditionalQuestionsFlow(input);
}

const prompt = ai.definePrompt({
  name: 'suggestAdditionalQuestionsPrompt',
  input: {schema: SuggestAdditionalQuestionsInputSchema},
  output: {schema: SuggestAdditionalQuestionsOutputSchema},
  prompt: `You are an AI assistant helping doctors to conduct a comprehensive anamnesis.

  Based on the current transcript, the questions already answered, and the current screening section, suggest additional questions to ask.

  Current Transcript:
  {{transcript}}

  Answered Questions:
  {{#each answeredQuestions}}- {{this}}\n{{/each}}

  Current Screening Section:
  {{screeningSection}}

  Suggested Questions:
  `, //Ensure prompt is closed
});

const suggestAdditionalQuestionsFlow = ai.defineFlow(
  {
    name: 'suggestAdditionalQuestionsFlow',
    inputSchema: SuggestAdditionalQuestionsInputSchema,
    outputSchema: SuggestAdditionalQuestionsOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
