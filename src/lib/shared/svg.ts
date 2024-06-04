import turfRewind from '@turf/rewind'
import { geoProjection, geoPath } from 'd3-geo'

import type { Point, GeojsonPolygon } from '@allmaps/types'

const mercator = geoProjection((x, y) => [x, Math.log(Math.tan(Math.PI / 4 + y / 2))])

const path = geoPath().projection(mercator)

export function geometryToPath(polygon: GeojsonPolygon) {
  turfRewind(polygon, { mutate: true, reverse: true })

  const width = 100
  const height = 100

  mercator.scale(1).translate([0, 0])

  const bounds = path.bounds(polygon)

  const scale =
    0.95 / Math.max((bounds[1][0] - bounds[0][0]) / width, (bounds[1][1] - bounds[0][1]) / height)

  const translate: Point = [
    (width - scale * (bounds[1][0] + bounds[0][0])) / 2,
    (height - scale * (bounds[1][1] + bounds[0][1])) / 2
  ]

  mercator.scale(scale).translate(translate)

  const d = path(polygon)

  const containsNaN = d && d.indexOf('NaN') > -1

  if (!containsNaN) {
    return d
  } else {
    return
  }
}
