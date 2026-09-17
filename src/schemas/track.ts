//v1
import { z } from "astro/zod";

export const linkSchema = z.object({
  type: z.enum(["page", "download"]),
  host: z.string(),
  url: z.string().refine((val) => URL.canParse(val), { message: "Invalid URL" }),
});

export const releaseFactsSchema = z.object({
  lengthKm: z.number().positive().optional(),
  pits: z.number().int().positive().optional(),
  layouts: z.number().int().positive().optional(),
});

export const releaseSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, "Release ID must be kebab-case"),
  name: z.string().min(1),
  authors: z.array(z.string().min(1)).min(1),
  facts: releaseFactsSchema.optional(),
  links: z.array(linkSchema).min(1),
});

export const resourceSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/, "Resource ID must be local kebab-case"),
  name: z.string().min(1),
  authors: z.array(z.string().min(1)).min(1),
  for: z.array(z.string()).min(1),
  kind: z.string().min(1).optional(),
  links: z.array(linkSchema).min(1),
});

export const trackEntrySchema = z
  .object({
    schemaVersion: z.literal(1),
    id: z.string().regex(/^[a-z0-9-]+$/, "Entry ID must be kebab-case"),
    name: z.string().min(1),
    releases: z.array(releaseSchema).min(1),
    resources: z.array(resourceSchema).default([]),
  })
  .superRefine((entry, ctx) => {
    const releaseIds = new Set<string>();

    for (const [index, release] of entry.releases.entries()) {
      if (releaseIds.has(release.id)) {
        ctx.addIssue({
          code: "custom",
          path: ["releases", index, "id"],
          message: `Duplicate release ID: ${release.id}`,
        });
      }
      releaseIds.add(release.id);
    }

    const resourceIds = new Set<string>();

    for (const [index, resource] of entry.resources.entries()) {
      if (resourceIds.has(resource.id)) {
        ctx.addIssue({
          code: "custom",
          path: ["resources", index, "id"],
          message: `Duplicate resource ID: ${resource.id}`,
        });
      }
      resourceIds.add(resource.id);

      for (const releaseId of resource.for) {
        if (!releaseIds.has(releaseId)) {
          ctx.addIssue({
            code: "custom",
            path: ["resources", index, "for"],
            message: `Unknown release ID: "${releaseId}". Expected one of: [${[...releaseIds].join(", ")}]`,
          });
        }
      }
    }
  });

export type TrackEntry = z.infer<typeof trackEntrySchema>;
