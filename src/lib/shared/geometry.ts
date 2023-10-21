import turfRewind from '@turf/rewind'
import { geoProjection, geoPath } from 'd3-geo'

import type { Polygon } from 'geojson'

import type { Size, Padding } from './types.js'

const mercator = geoProjection((x, y) => [x, Math.log(Math.tan(Math.PI / 4 + y / 2))])

const path = geoPath().projection(mercator)

export function geometryToPixels(polygon: Polygon, size: Size, padding: Padding) {
  turfRewind(polygon, { mutate: true, reverse: true })

  mercator.scale(1).translate([0, 0])

  const bounds = path.bounds(polygon)

  const width = size[0] - padding[1] - padding[3]
  const height = size[1] - padding[0] - padding[2]

  const scale =
    1 / Math.max((bounds[1][0] - bounds[0][0]) / width, (bounds[1][1] - bounds[0][1]) / height)

  const translate: [number, number] = [
    (width - scale * (bounds[1][0] + bounds[0][0])) / 2 + padding[3],
    (height - scale * (bounds[1][1] + bounds[0][1])) / 2 + padding[0]
  ]

  mercator.scale(scale).translate(translate)

  let pixelCoordinates: [number, number][] = []

  polygon.coordinates[0].slice(1).forEach((coordinate) => {
    const pixelCoordinate = mercator([coordinate[0], coordinate[1]])
    if (pixelCoordinate) {
      pixelCoordinates.push(pixelCoordinate)
    }
  })

  return pixelCoordinates
}

export function coordinatesToSvgPoints(coordinates: [number, number][]) {
  return coordinates.map((coordinate) => coordinate.join(',')).join(' ')
}
