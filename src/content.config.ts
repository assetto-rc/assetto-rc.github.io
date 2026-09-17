import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { trackEntrySchema } from './schemas/track';

export const collections = {
  tracks: defineCollection({
    loader: glob({ pattern: '**/*.json', base: './data' }),
    schema: trackEntrySchema,
  }),
};
