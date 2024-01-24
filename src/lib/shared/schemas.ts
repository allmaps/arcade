import { z } from 'zod'

export const ConfigurationSchema = z.object({
  map: z
    .object({
      center: z.array(z.number()).length(2).nullish(),
      zoom: z.number().nullish(),
      minZoom: z.number().nullish(),
      maxZoom: z.number().nullish(),
      maxBounds: z.array(z.array(z.number()).length(2)).length(2).nullish()
    })
    .nullish(),
  score: z
    .object({
      maxScore: z
        .object({
          min: z.number().nullish(),
          max: z.number().nullish()
        })
        .nullish(),
      area: z
        .object({
          min: z.number().nullish(),
          max: z.number().nullish()
        })
        .nullish(),
      time: z
        .object({
          min: z.number().nullish(),
          max: z.number().nullish()
        })
        .nullish(),
      maxWarpedMapDistance: z.number().nullish(),
      maxZoomDifference: z.number().nullish(),
      displayScoreMultiplier: z.number().nullish()
    })
    .nullish(),
  annotationUrls: z.array(z.string().url()).nullish()
})
