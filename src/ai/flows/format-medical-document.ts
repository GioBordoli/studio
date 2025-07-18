'use server';

/**
 * @fileOverview This flow formats the interview output into a professional-quality medical document.
 *
 * - formatMedicalDocument - A function that formats the interview output.
 * - FormatMedicalDocumentInput - The input type for the formatMedicalDocument function.
 * - FormatMedicalDocumentOutput - The return type for the formatMedicalDocument function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const FormatMedicalDocumentInputSchema = z.object({
  interviewData: z
    .string()
    .describe("I dati del colloquio contenenti domande e risposte."),
});
export type FormatMedicalDocumentInput = z.infer<typeof FormatMedicalDocumentInputSchema>;

const FormatMedicalDocumentOutputSchema = z.object({
  formattedDocument: z
    .string()
    .describe("Il documento medico formattato con domande e risposte."),
});
export type FormatMedicalDocumentOutput = z.infer<typeof FormatMedicalDocumentOutputSchema>;

export async function formatMedicalDocument(
  input: FormatMedicalDocumentInput
): Promise<FormatMedicalDocumentOutput> {
  return formatMedicalDocumentFlow(input);
}

const prompt = ai.definePrompt({
  name: 'formatMedicalDocumentPrompt',
  input: {schema: FormatMedicalDocumentInputSchema},
  output: {schema: FormatMedicalDocumentOutputSchema},
  prompt: `Sei un esperto formattatore di documenti medici.

Riceverai i dati di un colloquio contenenti domande e risposte di una consultazione medica.
Il tuo compito è formattare questi dati in un documento medico di qualità professionale con domande e risposte chiare in modo strutturato e facilmente leggibile.

Dati del colloquio:
{{{interviewData}}}

Documento Medico Formattato:
`,
});

const formatMedicalDocumentFlow = ai.defineFlow(
  {
    name: 'formatMedicalDocumentFlow',
    inputSchema: FormatMedicalDocumentInputSchema,
    outputSchema: FormatMedicalDocumentOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
