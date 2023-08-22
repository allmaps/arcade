import { Stroke, Fill, Style } from 'ol/style'

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
      width: 10
    }),
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0.0)'
    })
  })
}
