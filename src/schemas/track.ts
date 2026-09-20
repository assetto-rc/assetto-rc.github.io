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

export const releaseSchema = z.object({
  id: z
    .string()
    .regex(/^[a-z0-9-]+$/, "Release ID must be kebab-case")
    .optional(),
  label: z.string().min(1).optional(),
  authors: z.array(z.string().min(1)).min(1),
  lengthKm: z.number().positive().optional(),
  pits: z.number().int().positive().optional(),
  layouts: z.number().int().positive().optional(),
  links: z.array(linkSchema).min(1),
});

export const resourceSchema = z.object({
  name: z.string().min(1),
  authors: z.array(z.string().min(1)).min(1),
  for: z.array(z.string()).optional(),
  kind: resourceKindEnum,
  links: z.array(linkSchema).min(1),
});

export const camtoolSchema = z.object({
  authors: z.array(z.string().min(1)).min(1),
  label: z.string().min(1).optional(),
  for: z.array(z.string()).optional(),
  links: z.array(linkSchema).min(1),
});

export const trackEntrySchema = z
  .object({
    name: z.string().min(1),
    releases: z.array(releaseSchema).min(1),
    resources: z.array(resourceSchema).default([]),
    camtools: z.array(camtoolSchema).default([]),
  })
  .superRefine((entry, ctx) => {
    const isMultiRelease = entry.releases.length > 1;
    const releaseIds = new Set<string>();

    // validate releases
    for (const [index, release] of entry.releases.entries()) {
      if (isMultiRelease) {
        if (!release.id) {
          ctx.addIssue({
            code: "custom",
            path: ["releases", index, "id"],
            message: "Release ID is required when multiple releases are defined.",
          });
        } else {
          if (releaseIds.has(release.id)) {
            ctx.addIssue({
              code: "custom",
              path: ["releases", index, "id"],
              message: `Duplicate release ID: "${release.id}"`,
            });
          }
          releaseIds.add(release.id);
        }
      }
    }

    // validate resources
    for (const [index, resource] of entry.resources.entries()) {
      if (isMultiRelease) {
        if (!resource.for || resource.for.length === 0) {
          ctx.addIssue({
            code: "custom",
            path: ["resources", index, "for"],
            message: "The 'for' field is required when multiple releases exist.",
          });
          continue;
        }

        for (const targetId of resource.for) {
          if (!releaseIds.has(targetId)) {
            ctx.addIssue({
              code: "custom",
              path: ["resources", index, "for"],
              message: `Unknown release ID: "${targetId}". Expected one of: [${[...releaseIds].join(", ")}]`,
            });
          }
        }
      }
    }

    // validate camtools
    for (const [index, camtool] of entry.camtools.entries()) {
      if (isMultiRelease) {
        if (!camtool.for || camtool.for.length === 0) {
          ctx.addIssue({
            code: "custom",
            path: ["camtools", index, "for"],
            message: "The 'for' field is required on camtools when multiple releases exist.",
          });
          continue;
        }

        for (const targetId of camtool.for) {
          if (!releaseIds.has(targetId)) {
            ctx.addIssue({
              code: "custom",
              path: ["camtools", index, "for"],
              message: `Unknown release ID: "${targetId}". Expected one of: [${[...releaseIds].join(", ")}]`,
            });
          }
        }
      }
    }
  });

export type TrackEntry = z.infer<typeof trackEntrySchema>;
export type ResourceKind = z.infer<typeof resourceKindEnum>;
export type Camtool = z.infer<typeof camtoolSchema>;
export type Release = z.infer<typeof releaseSchema>;
export type Resource = z.infer<typeof resourceSchema>;
