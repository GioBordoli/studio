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
    .describe('La trascrizione corrente della sessione di anamnesi.'),
  answeredQuestions: z
    .array(z.string())
    .describe("L'elenco delle domande a cui è già stata data una risposta."),
  screeningSection: z
    .string()
    .describe('La sezione di screening corrente in esame.'),
});
export type SuggestAdditionalQuestionsInput = z.infer<
  typeof SuggestAdditionalQuestionsInputSchema
>;

const SuggestAdditionalQuestionsOutputSchema = z.object({
  suggestedQuestions: z
    .array(z.string())
    .describe("L'elenco delle domande suggerite da porre."),
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
  prompt: `Sei un assistente AI che aiuta i medici a condurre un'anamnesi completa.

  Sulla base della trascrizione corrente, delle domande a cui è già stata data risposta e della sezione di screening corrente, suggerisci ulteriori domande da porre.

  Trascrizione corrente:
  {{transcript}}

  Domande con risposta:
  {{#each answeredQuestions}}- {{this}}\n{{/each}}

  Sezione di screening corrente:
  {{screeningSection}}

  Domande suggerite:
  `,
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
