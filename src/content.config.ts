import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

// Redaktionelle Texte (Markdown). Entwürfe werden nicht gerendert.
const wirkstoffe = defineCollection({
  loader: glob({ pattern: '*.md', base: './content/wirkstoffe' }),
  schema: z.object({
    title: z.string(),
    description: z.string().max(170),
    substanceId: z.string(),
    status: z.enum(['draft', 'published']),
    author: z.string(),
    reviewedBy: z.string().nullable(),
    updatedAt: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  }),
});

export const collections = { wirkstoffe };
