import type { Feature } from 'geojson'

export function generateEmptyFeatureCollection() {
  return {
    type: 'FeatureCollection' as const,
    features: [] as Feature[]
  }
}
