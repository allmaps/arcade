import type { Map, LngLatLike } from 'maplibre-gl'

import type { DataDrivenPropertyValueSpecification, ColorSpecification } from 'maplibre-gl'
import type { CallbackFn } from '$lib/shared/types.js'

import { WARPED_MAP_BEHIND_LABELS } from '$lib/shared/constants.js'

function easeOut(t: number) {
  return t * (2 - t)
}

export function makeHandleKeydownWithPanStepAndZoomFraction(panStep: number, zoomFraction = 0) {
  return function handleKeydown(e: KeyboardEvent) {
    // if (e.altKey || e.ctrlKey || e.metaKey) {
    //   return
    // }

    let zoomDir = 0
    let xDir = 0
    let yDir = 0

    switch (e.keyCode) {
      case 61:
      case 107:
      case 171:
      case 187:
        zoomDir = 1
        break

      case 189:
      case 109:
      case 173:
        zoomDir = -1
        break

      case 37:
        e.preventDefault()
        xDir = -1
        break

      case 39:
        e.preventDefault()
        xDir = 1
        break

      case 38:
        e.preventDefault()
        yDir = -1
        break

      case 40:
        e.preventDefault()
        yDir = 1
        break

      default:
        return
    }

    return {
      cameraAnimation: (map: Map) => {
        const currentZoom = map.getZoom()
        const newZoom = Math.round(currentZoom - zoomFraction + zoomDir) + zoomFraction
        const center = map.getCenter()

        map.easeTo(
          {
            duration: 300,
            easeId: 'keyboardHandler',
            easing: easeOut,
            zoom: zoomDir ? newZoom : currentZoom,
            bearing: 0,
            pitch: 0,
            offset: [-xDir * panStep, -yDir * panStep],
            center
          },
          { originalEvent: e }
        )
      }
    }
  }
}

export function flyTo(map: Map, center: LngLatLike, zoom: number, callback?: CallbackFn) {
  map.stop()

  if (callback) {
    function handleMoveend({
      originalEvent
    }: {
      originalEvent: MouseEvent | TouchEvent | WheelEvent | undefined
    }) {
      if (!originalEvent) {
        map.off('moveend', handleMoveend)
        callback?.()
      }
    }
    map.on('moveend', handleMoveend)
  }

  map.flyTo({
    center,
    zoom,
    essential: true
  })
}

export function createZoomInEvent() {
  return new KeyboardEvent('keydown', {
    keyCode: 187,
    key: 'Equal',
    bubbles: true
  })
}

export function createZoomOutEvent() {
  return new KeyboardEvent('keydown', {
    keyCode: 189,
    key: 'Minus',
    bubbles: true
  })
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

export function disableInteraction(map: Map) {
  map.scrollZoom.disable()
  map.boxZoom.disable()
  map.dragPan.disable()
  map.keyboard.disable()
  map.doubleClickZoom.disable()
}

export function enableInteraction(map: Map) {
  map.scrollZoom.enable()
  map.boxZoom.enable()
  map.dragPan.enable()
  map.keyboard.enable()
  map.doubleClickZoom.enable()
}
