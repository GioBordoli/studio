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
  transcription: z.string().describe('La trascrizione della conversazione.'),
});
export type IdentifyQuestionsAndAnswersInput = z.infer<typeof IdentifyQuestionsAndAnswersInputSchema>;

const QuestionAnswerPairSchema = z.object({
  question: z.string().describe('La domanda identificata.'),
  answer: z.string().describe('La risposta identificata.'),
  category: z.string().describe('La categoria della domanda (es. anamnesi, sintomi).'),
});

const IdentifyQuestionsAndAnswersOutputSchema = z.array(QuestionAnswerPairSchema).describe('Un array di coppie domanda-risposta con le loro categorie.');
export type IdentifyQuestionsAndAnswersOutput = z.infer<typeof IdentifyQuestionsAndAnswersOutputSchema>;

export async function identifyQuestionsAndAnswers(input: IdentifyQuestionsAndAnswersInput): Promise<IdentifyQuestionsAndAnswersOutput> {
  return identifyQuestionsAndAnswersFlow(input);
}

const prompt = ai.definePrompt({
  name: 'identifyQuestionsAndAnswersPrompt',
  input: {schema: IdentifyQuestionsAndAnswersInputSchema},
  output: {schema: IdentifyQuestionsAndAnswersOutputSchema},
  prompt: `Sei un dottore esperto di anamnesi medica. Il tuo compito è analizzare la trascrizione data di una conversazione medico-paziente e identificare le domande poste dal medico e le corrispondenti risposte date dal paziente. 
  Categorizza ogni coppia domanda-risposta in sezioni di screening medico pertinenti (es. storia medica, sintomi attuali, allergie, farmaci, storia familiare, storia sociale). 
  Restituisci un array JSON di coppie domanda-risposta, ognuna includendo la domanda, la risposta e la categoria determinata. 
  Assicurati che il JSON sia valido e analizzabile.

Trascrizione:
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
