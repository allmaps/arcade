import { Stroke, Fill, Style } from 'ol/style'

import type OLMap from 'ol/Map.js'

import type { BBox, Padding } from '$lib/shared/types.js'

//TODO: import from stdlib or types modyle

export function maskToPolygon(resourceMask: [number, number][]) {
  return [
    [
      ...resourceMask.map((coordinate) => [coordinate[0], -coordinate[1]]),
      [resourceMask[0][0], -resourceMask[0][1]]
    ]
  ]
}

export function maskStyle(color: string) {
  return new Style({
    stroke: new Stroke({
      color,
      width: 10,
      lineCap: 'square'
    }),
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0.0)'
    })
  })
}

export function getZoomForExtent(map: OLMap, bounds: BBox, padding: Padding) {
  const size = map.getSize()

  if (!size) {
    return
  }

  const paddedSize = [size[0] - padding[1] - padding[3], size[1] - padding[0] - padding[2]]
  return map
    .getView()
    .getZoomForResolution(map.getView().getResolutionForExtent(bounds, paddedSize))
}
