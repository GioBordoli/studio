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
    .describe("The interview data containing questions and answers."),
});
export type FormatMedicalDocumentInput = z.infer<typeof FormatMedicalDocumentInputSchema>;

const FormatMedicalDocumentOutputSchema = z.object({
  formattedDocument: z
    .string()
    .describe("The formatted medical document with questions and answers."),
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
  prompt: `You are an expert medical document formatter.

You will receive interview data containing questions and answers from a medical consultation.
Your task is to format this data into a professional-quality medical document with clear questions and answers in a structured, easily-readable manner.

Interview Data:
{{{interviewData}}}

Formatted Medical Document:
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
