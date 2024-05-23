import turfRewind from '@turf/rewind'
import turfConvex from '@turf/convex'
import { geoProjection, geoPath } from 'd3-geo'
// import { fromLonLat } from 'ol/proj'

// import type { Extent } from 'ol/extent.js'
import type { Size, Point, GeojsonPolygon } from '@allmaps/types'

import type { Padding } from '$lib/shared/types.js'

const mercator = geoProjection((x, y) => [x, Math.log(Math.tan(Math.PI / 4 + y / 2))])

const path = geoPath().projection(mercator)

export function geometryToPixels(polygon: GeojsonPolygon, size: Size, padding: Padding) {
  turfRewind(polygon, { mutate: true, reverse: true })

  mercator.scale(1).translate([0, 0])

  const bounds = path.bounds(polygon)

  const width = size[0] - padding[1] - padding[3]
  const height = size[1] - padding[0] - padding[2]

  const scale =
    1 / Math.max((bounds[1][0] - bounds[0][0]) / width, (bounds[1][1] - bounds[0][1]) / height)

  const translate: Point = [
    (width - scale * (bounds[1][0] + bounds[0][0])) / 2 + padding[3],
    (height - scale * (bounds[1][1] + bounds[0][1])) / 2 + padding[0]
  ]

  mercator.scale(scale).translate(translate)

  let pixelCoordinates: Point[] = []

  polygon.coordinates[0].slice(1).forEach((coordinate) => {
    const pixelCoordinate = mercator([coordinate[0], coordinate[1]])
    if (pixelCoordinate) {
      pixelCoordinates.push(pixelCoordinate)
    }
  })

  return pixelCoordinates
}

export function coordinatesToSvgPoints(coordinates: Point[]) {
  return coordinates.map((coordinate) => coordinate.join(',')).join(' ')
}

export function getConvexHull(
  polygon1: GeojsonPolygon,
  polygon2: GeojsonPolygon
): GeojsonPolygon | undefined {
  const convexFeature = turfConvex({
    type: 'FeatureCollection',
    features: [
      {
        type: 'Feature',
        geometry: polygon1,
        properties: {}
      },
      {
        type: 'Feature',
        geometry: polygon2,
        properties: {}
      }
    ]
  })

  if (convexFeature) {
    return convexFeature.geometry as GeojsonPolygon
  }
}

// export function extentFromMaxBounds(maxBounds?: number[][] | null): Extent | undefined {
//   if (maxBounds) {
//     const [x1, y1] = fromLonLat(maxBounds[0])
//     const [x2, y2] = fromLonLat(maxBounds[1])

//     return [Math.min(x1, x2), Math.min(y1, y2), Math.max(x1, x2), Math.max(y1, y2)] as Extent
//   }
// }
