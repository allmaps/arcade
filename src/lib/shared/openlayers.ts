import { Stroke, Fill, Style } from 'ol/style'

import type OLMap from 'ol/Map.js'
import type View from 'ol/View.js'
import { getCenter } from 'ol/extent'
import GeoJSON from 'ol/format/GeoJSON.js'

import type { Polygon as GeoJsonPolygon } from 'geojson'

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
    })
    // fill: new Fill({
    //   color: 'rgba(255, 255, 255, 0.0)'
    // })
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

export function getGeoMaskExtent(geoMask: GeoJsonPolygon) {
  return new GeoJSON()
    .readGeometry(geoMask, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    })
    .getExtent()
}

export function flyTo(
  view: View,
  extent: number[],
  duration = 1000,
  done?: (complete: boolean) => void
) {
  view.cancelAnimations()

  // TODO: compute duration here!
  // const durationPerZoomLevel = 200
  // const duration = Math.abs(warpedMapZoom - submissionZoom) * durationPerZoomLevel

  // TODO: have a look at:
  // https://github.com/maplibre/maplibre-gl-js/blob/2db2f4e83b48cf44d272fb730df30f5b12d9bd0c/src/ui/camera.ts#L1207

  const currentZoom = view.getZoom()

  const resolution = view.getResolutionForExtent(extent)
  const newZoom = view.getZoomForResolution(resolution)
  const center = getCenter(extent)

  if (!currentZoom || !newZoom) {
    if (done) {
      done(false)
    }
    return
  }

  const halfwayZoom = Math.min(currentZoom, newZoom) - 1

  let parts = 2
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
      center,
      duration: duration
    },
    callback
  )
  view.animate(
    {
      zoom: halfwayZoom,
      duration: duration / 2
    },
    {
      zoom: newZoom,
      duration: duration / 2
    },
    callback
  )
}
