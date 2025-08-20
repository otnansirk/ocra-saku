'use server';

/**
 * @fileOverview Generates an audit report combining brand name and logo similarity search results.
 *
 * - generateAuditReport - A function that generates the audit report.
 * - GenerateAuditReportInput - The input type for the generateAuditReport function.
 * - GenerateAuditReportOutput - The return type for the generateAuditReport function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const MatchedMarkSchema = z.object({
  logoUrl: z.string().optional().describe('URL of the brand logo.'),
  name: z.string().describe('Brand name.'),
  link: z.string().optional().describe('Link to the brand details.'),
  status: z.string().optional().describe('Registration status of the brand.'),
  class: z.string().optional().describe('Brand class.'),
  description: z.string().optional().describe('Brand description.'),
  owner: z.string().optional().describe('Owner of the brand.'),
});

const BrandSearchResultSchema = z.object({
  isRegistered: z.boolean().describe('Whether the brand name is registered.'),
  matchedMarks: z
    .array(MatchedMarkSchema)
    .describe('List of similar or identical brand names.'),
  confidence: z.number().optional().describe('Confidence score of the search result.'),
});

export type BrandSearchResult = z.infer<typeof BrandSearchResultSchema>;

const SimilarityResultSchema = z.object({
  candidates: z.array(z.string()).describe('List of candidate logos/brands.'),
  similarityScore: z.number().describe('Similarity score (0-100).'),
  possibleDuplicate: z.boolean().describe('Whether the logo is a possible duplicate.'),
});

export type SimilarityResult = z.infer<typeof SimilarityResultSchema>;

const GenerateAuditReportInputSchema = z.object({
  brandSearchResult: BrandSearchResultSchema.describe(
    'Results from the brand name search.'
  ),
  similarityResult: SimilarityResultSchema.describe(
    'Results from the logo similarity search.'
  ),
});

export type GenerateAuditReportInput = z.infer<typeof GenerateAuditReportInputSchema>;

const GenerateAuditReportOutputSchema = z.object({
  duplicateRiskScore: z
    .number()
    .describe('Overall duplicate risk score (0-100).'),
  pdkiEligibilityPercent: z
    .number()
    .describe('Estimated percentage of eligibility for PDKI registration (0-100).'),
  notes: z.string().describe('Notes and recommendations based on the audit.'),
  timestamp: z.string().describe('Timestamp of when the audit report was generated'),
});

export type GenerateAuditReportOutput = z.infer<typeof GenerateAuditReportOutputSchema>;

export async function generateAuditReport(input: GenerateAuditReportInput): Promise<GenerateAuditReportOutput> {
  return generateAuditReportFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateAuditReportPrompt',
  input: {schema: GenerateAuditReportInputSchema},
  output: {schema: GenerateAuditReportOutputSchema},
  system:
    "You are an expert brand auditor. Analyze the provided brand search results and logo similarity results to generate an audit report. Based on these results, determine the duplicate risk score, estimate the PDKI eligibility percentage, and provide notes and recommendations. Make sure the timestamp is in ISO format.",
  prompt: `Brand Search Results:
Is Registered: {{brandSearchResult.isRegistered}}
Matched Marks: {{#each brandSearchResult.matchedMarks}}{{this.name}}, {{/each}}
Confidence: {{brandSearchResult.confidence}}

Logo Similarity Results:
Candidates: {{#each similarityResult.candidates}}{{{this}}}, {{/each}}
Similarity Score: {{similarityResult.similarityScore}}
Possible Duplicate: {{similarityResult.possibleDuplicate}}
`,
});

const generateAuditReportFlow = ai.defineFlow(
  {
    name: 'generateAuditReportFlow',
    inputSchema: GenerateAuditReportInputSchema,
    outputSchema: GenerateAuditReportOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    if (!output) {
      throw new Error("Failed to generate report from prompt.");
    }
    output.timestamp = new Date().toISOString();
    return output;
  }
);
