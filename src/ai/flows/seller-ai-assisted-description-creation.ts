'use server';
/**
 * @fileOverview A Genkit flow for an AI assistant to generate detailed product descriptions and relevant keywords for sellers.
 *
 * - generateProductDescription - A function that handles the AI-assisted description generation process.
 * - GenerateProductDescriptionInput - The input type for the generateProductDescription function.
 * - GenerateProductDescriptionOutput - The return type for the generateProductDescription function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const GenerateProductDescriptionInputSchema = z.object({
  productTitle: z.string().describe('The initial title of the product.'),
  initialKeywords: z.array(z.string()).describe('Initial keywords provided by the seller.'),
  category: z.string().describe('The selected product category (e.g., "Women\'s Apparel", "Electronics").'),
  briefDescription: z.string().optional().describe('An optional brief description or notes from the seller.'),
});
export type GenerateProductDescriptionInput = z.infer<typeof GenerateProductDescriptionInputSchema>;

const GenerateProductDescriptionOutputSchema = z.object({
  detailedDescription: z.string().describe('The AI-generated detailed and compelling product description.'),
  suggestedKeywords: z.array(z.string()).describe('A list of AI-generated relevant and SEO-friendly keywords.'),
});
export type GenerateProductDescriptionOutput = z.infer<typeof GenerateProductDescriptionOutputSchema>;

export async function generateProductDescription(input: GenerateProductDescriptionInput): Promise<GenerateProductDescriptionOutput> {
  return generateProductDescriptionFlow(input);
}

const prompt = ai.definePrompt({
  name: 'generateProductDescriptionPrompt',
  input: {schema: GenerateProductDescriptionInputSchema},
  output: {schema: GenerateProductDescriptionOutputSchema},
  prompt: `You are an expert marketing assistant for an online C2C fashion and goods marketplace (like Vinted). Your goal is to help sellers create compelling, detailed, and SEO-friendly product listings.

Based on the following information, generate a detailed product description and a list of relevant keywords.

Product Title: {{{productTitle}}}
Product Category: {{{category}}}
Initial Keywords: {{#each initialKeywords}}{{{this}}}{{sep}}, {{/sep}}{{/each}}
{{#if briefDescription}}Seller's Notes: {{{briefDescription}}}{{/if}}

Your response should be in JSON format, containing a 'detailedDescription' (a paragraph describing the item, its condition, style, and potential uses) and 'suggestedKeywords' (an array of comma-separated keywords to help buyers find the item). Ensure the description highlights unique selling points and is engaging.
`,
});

const generateProductDescriptionFlow = ai.defineFlow(
  {
    name: 'generateProductDescriptionFlow',
    inputSchema: GenerateProductDescriptionInputSchema,
    outputSchema: GenerateProductDescriptionOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
