import {
  createZoomInEvent as createOpenLayersZoomInEvent,
  createZoomOutEvent as createOpenLayersZoomOutEvent
} from '$lib/shared/openlayers'
import {
  createZoomInEvent as createMaplibreZoomInEvent,
  createZoomOutEvent as createMaplibreZoomOutEvent
} from '$lib/shared/maplibre'

import type { KeyboardTarget } from '$lib/shared/types.js'

export function zoomIn(target?: KeyboardTarget) {
  if (!target) {
    return
  }
  const event =
    target.library === 'maplibre' ? createMaplibreZoomInEvent() : createOpenLayersZoomInEvent()
  target.element.dispatchEvent(event)
}

export function zoomOut(target?: KeyboardTarget) {
  if (!target) {
    return
  }

  const event =
    target.library === 'maplibre' ? createMaplibreZoomOutEvent() : createOpenLayersZoomOutEvent()
  target.element.dispatchEvent(event)
}
