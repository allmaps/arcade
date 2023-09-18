import { DEFAULT_RADIUS } from 'ol/sphere.js'

const MAX_POINTS = 5000

const CIRCUMFERENCE = 2 * Math.PI * DEFAULT_RADIUS
const MAX_DISTANCE = CIRCUMFERENCE / 2

export function computeScore(distance: number, warpedMapGeoMaskArea: number, svgGeoArea: number) {
  const distanceRatio = Math.max(1 - distance / MAX_DISTANCE, 0)

  let areaRatio = Math.sqrt(warpedMapGeoMaskArea / svgGeoArea)
  if (areaRatio > 1) {
    areaRatio = 1 / areaRatio
  }

  const score = Math.round(distanceRatio * areaRatio * MAX_POINTS)

  return score
}
