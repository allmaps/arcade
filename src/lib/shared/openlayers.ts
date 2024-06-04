import { Stroke, Style, Fill } from 'ol/style'

import GeoJSON from 'ol/format/GeoJSON.js'

import type { GeojsonPolygon } from '@allmaps/types'

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
      lineCap: 'square',
      lineJoin: 'miter'
    })
  })
}

export function convexHullStyle(color: string) {
  return new Style({
    fill: new Fill({
      color
    })
  })
}

export function getExtent(polygon: GeojsonPolygon) {
  return new GeoJSON()
    .readGeometry(polygon, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    })
    .getExtent()
}

export function createZoomInEvent() {
  return new KeyboardEvent('keydown', {
    key: '+'
  })
}

export function createZoomOutEvent() {
  return new KeyboardEvent('keydown', {
    key: '-'
  })
}
