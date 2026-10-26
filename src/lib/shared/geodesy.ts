import { distance } from '@turf/distance'

import type { Point } from '@allmaps/types'

export { area as getArea } from '@turf/area'

// Scores use meters; Turf's default distance unit is kilometers.
export function getDistance(from: Point, to: Point): number {
  return distance(from, to, { units: 'meters' })
}
