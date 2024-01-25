import { z } from 'zod'

export const ConfigurationSchema = z.object({
  meta: z
    .object({
      name: z.string().optional(),
      description: z.string().optional(),
      affiliation: z.string().optional()
    })
    .optional()
    .nullable(),
  map: z.object({
    center: z.array(z.number()).length(2),
    zoom: z.number(),
    minZoom: z.number(),
    maxZoom: z.number(),
    maxBounds: z.array(z.array(z.number()).length(2)).length(2).nullable().optional()
  }),
  score: z.object({
    maxScore: z.object({
      min: z.number(),
      max: z.number()
    }),
    area: z.object({
      min: z.number(),
      max: z.number()
    }),
    time: z.object({
      min: z.number(),
      max: z.number()
    }),
    maxWarpedMapDistance: z.number(),
    maxZoomDifference: z.number(),
    displayScoreMultiplier: z.number()
  }),
  annotationUrls: z.array(z.string().url())
})
