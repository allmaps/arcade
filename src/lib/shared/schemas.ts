import { z } from 'zod'

export const ConfigurationSchema = z.object({
  map: z.object({
    bounds: z.array(z.number()).length(4).optional(),
    center: z.array(z.number()).length(2),
    zoom: z.number(),
    maxZoom: z.number()
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
