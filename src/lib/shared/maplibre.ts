import { Map, addProtocol, setWorkerUrl } from 'maplibre-gl'
import { layers, namedFlavor } from '@protomaps/basemaps'
import { Protocol } from 'pmtiles'
import { createMapControls } from './map-controls.js'
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?worker&url'

import type { LngLatLike, MapOptions, StyleSpecification } from 'maplibre-gl'

import type { DataDrivenPropertyValueSpecification, ColorSpecification } from 'maplibre-gl'
import type { CallbackFn } from '$lib/shared/types.js'

import { WARPED_MAP_BEHIND_LABELS } from '$lib/shared/constants.js'

setWorkerUrl(workerUrl)

let protocol: Protocol | undefined

function createBasemapStyle(): StyleSpecification {
  if (!protocol) {
    protocol = new Protocol()
    addProtocol('pmtiles', protocol.tile)
  }

  const basemapLayers = layers('protomaps', namedFlavor('light'), { lang: 'en' })
  const background = basemapLayers.find((layer) => layer.type === 'background')
  if (background?.type === 'background') {
    background.paint = { ...background.paint, 'background-color': 'rgba(0, 0, 0, 0)' }
  }

  return {
    version: 8,
    glyphs: 'https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf',
    sources: {
      protomaps: {
        type: 'vector',
        tiles: [import.meta.env.ARCADE_PMTILES_URL],
        maxzoom: 14,
        attribution:
          '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>'
      }
    },
    layers: basemapLayers
  }
}

export function createArcadeMap(options: Omit<MapOptions, 'style'> & { basemap?: boolean }) {
  const { basemap = true, ...mapOptions } = options
  const map = new Map({
    maxPitch: 0,
    bearingSnap: 0,
    attributionControl: false,
    ...mapOptions,
    style: basemap ? createBasemapStyle() : { version: 8, sources: {}, layers: [] }
  })
  map.dragRotate.disable()
  map.touchZoomRotate.disableRotation()
  map.touchPitch.disable()

  const controls = createMapControls(map)
  const resizeObserver = new ResizeObserver(() => map.resize())
  resizeObserver.observe(map.getContainer())

  return {
    map,
    controls,
    destroy: () => {
      resizeObserver.disconnect()
      controls.destroy()
      map.remove()
    }
  }
}

export function flyTo(map: Map, center: LngLatLike, zoom: number, callback?: CallbackFn) {
  map.stop()

  if (callback) {
    function handleMoveend({
      originalEvent,
      arcadeInteraction
    }: {
      originalEvent?: MouseEvent | TouchEvent | WheelEvent | KeyboardEvent
      arcadeInteraction?: boolean
    }) {
      if (!originalEvent && !arcadeInteraction) {
        map.off('moveend', handleMoveend)
        callback?.()
      }
    }
    map.on('moveend', handleMoveend)
  }

  map.flyTo(
    {
      center,
      zoom,
      essential: true
    },
    { flyTo: true }
  )
}

export function maskStyle(color: DataDrivenPropertyValueSpecification<ColorSpecification>) {
  return {
    layout: {
      'line-join': 'miter' as const,
      'line-cap': 'square' as const
    },
    paint: {
      'line-color': color,
      'line-width': 10
    }
  }
}
export function convexHullStyle(color: DataDrivenPropertyValueSpecification<ColorSpecification>) {
  return {
    'fill-opacity-transition': {
      duration: 5000,
      delay: 1000
    },
    layout: {},
    paint: {
      'fill-color': color,
      'fill-opacity': 0
    }
  }
}

export function getFirstSymbolLayerId(map: Map) {
  if (!WARPED_MAP_BEHIND_LABELS) {
    return
  }

  const layers = map.getStyle().layers

  // Find the index of the first symbol layer in the map style
  let firstSymboLayerlId
  for (const layer of layers) {
    if (layer.type === 'symbol') {
      firstSymboLayerlId = layer.id
      break
    }
  }

  return firstSymboLayerlId
}
