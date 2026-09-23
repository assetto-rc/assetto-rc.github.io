// src/schemas/track.ts
import { z } from "astro/zod";

export const resourceKindEnum = z.enum([
  "visual",
  "ai",
  "camera",
  "skin",
  "layout",
]);

export const linkSchema = z
  .string()
  .refine((val) => URL.canParse(val), { message: "Invalid URL" });

export const resourceSchema = z.object({
  name: z.string().min(1),
  authors: z.array(z.string().min(1)).min(1),
  kind: resourceKindEnum,
  links: z.array(linkSchema).min(1),
});

export const camtoolSchema = z.object({
  authors: z.array(z.string().min(1)).min(1),
  label: z.string().min(1).optional(),
  links: z.array(linkSchema).min(1),
});

export const trackEntrySchema = z.object({
  name: z.string().min(1),
  folder: z.string().min(1).optional(),
  authors: z.array(z.string().min(1)).min(1),
  lengthKm: z.number().positive().optional(),
  pits: z.number().int().positive().optional(),
  layouts: z.number().int().positive().optional(),
  links: z.array(linkSchema).default([]),
  resources: z.array(resourceSchema).default([]),
  camtools: z.array(camtoolSchema).default([]),
});

export type TrackEntry = z.infer<typeof trackEntrySchema>;
export type ResourceKind = z.infer<typeof resourceKindEnum>;
export type Camtool = z.infer<typeof camtoolSchema>;
export type Resource = z.infer<typeof resourceSchema>;
