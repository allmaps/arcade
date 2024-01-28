import { Stroke, Style, Fill } from 'ol/style'

import type OLMap from 'ol/Map.js'
import type View from 'ol/View.js'
import { getCenter, type Extent } from 'ol/extent'
import GeoJSON from 'ol/format/GeoJSON.js'

import type { Polygon as GeoJsonPolygon } from 'geojson'

import type { BBox, Padding } from '$lib/shared/types.js'

//TODO: import from stdlib or types module

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

export function getExtent(polygon: GeoJsonPolygon) {
  return new GeoJSON()
    .readGeometry(polygon, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    })
    .getExtent()
}

export function flyTo(
  view: View,
  extents: Extent[],
  duration = 2000,
  done?: (complete: boolean) => void
) {
  view.cancelAnimations()

  // TODO: compute duration here!
  // const durationPerZoomLevel = 200
  // const duration = Math.abs(warpedMapZoom - submissionZoom) * durationPerZoomLevel

  // TODO: have a look at:
  // https://github.com/maplibre/maplibre-gl-js/blob/2db2f4e83b48cf44d272fb730df30f5b12d9bd0c/src/ui/camera.ts#L1207

  const currentZoom = view.getZoom()

  const resolutions = extents.map((extent) => view.getResolutionForExtent(extent))
  const zooms = resolutions.map((resolution) => view.getZoomForResolution(resolution))
  const lastExtentCenter = getCenter(extents[extents.length - 1])

  if (!currentZoom || zooms.includes(undefined)) {
    if (done) {
      done(false)
    }
    return
  }

  // const halfwayZoom = Math.min(currentZoom, newZoom) - 1

  let parts = extents.length
  let called = false

  function callback(complete: boolean) {
    --parts
    if (called) {
      return
    }
    if (parts === 0 || !complete) {
      called = true
      if (done) {
        done(complete)
      }
    }
  }

  view.animate(
    {
      center: lastExtentCenter,
      duration: duration
    },
    callback
  )
  view.animate(
    // {
    //   zoom: halfwayZoom,
    //   duration: duration / extents.length
    // },
    // {
    //   zoom: newZoom,
    //   duration: duration/ extents.length
    // },
    ...zooms.map((zoom) => ({
      zoom,
      duration: duration / extents.length
    })),
    callback
  )
}

export function zoomIn(olTarget: HTMLElement | undefined) {
  olTarget?.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: '+'
    })
  )
}

export function zoomOut(olTarget: HTMLElement | undefined) {
  olTarget?.dispatchEvent(
    new KeyboardEvent('keydown', {
      key: '-'
    })
  )
}
