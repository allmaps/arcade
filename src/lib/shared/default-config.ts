import type { Configuration } from '$lib/shared/types.js'

// TODO: parse default config from YAML?
export default {
  map: {
    center: [0, 0],
    initialZoom: 2
  },
  score: {
    maxScore: {
      min: 10,
      max: 100
    },
    area: {
      // Size of city block in square meters
      min: 100 * 100,
      // Size of small country in square meters
      max: 25_000 * 1_000 * 1_000
    },
    time: {
      min: 8,
      max: 5 * 60
    },
    maxWarpedMapDistance: 50,
    maxZoomDifference: 4,
    displayScoreMultiplier: 100
  },
  annotationUrls: []
} satisfies Configuration
