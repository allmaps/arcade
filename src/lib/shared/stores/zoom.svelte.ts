import { setContext, getContext } from 'svelte'

import type { MappingLibrary } from '$lib/shared/types.js'

const ZOOM_KEY = Symbol('zoom')

const ZOOM_LIMIT_EPSILON = 0.01

type ZoomLimits = {
  canZoomIn: boolean
  canZoomOut: boolean
}

export class ZoomState {
  #limits = $state<Record<MappingLibrary, ZoomLimits>>({
    maplibre: { canZoomIn: true, canZoomOut: true },
    openlayers: { canZoomIn: true, canZoomOut: true }
  })

  getLimits(library: MappingLibrary) {
    return this.#limits[library]
  }

  setZoom(library: MappingLibrary, zoom: number, minZoom: number, maxZoom: number) {
    this.#limits[library] = {
      canZoomIn: zoom < maxZoom - ZOOM_LIMIT_EPSILON,
      canZoomOut: zoom > minZoom + ZOOM_LIMIT_EPSILON
    }
  }
}

export function setZoomState() {
  return setContext(ZOOM_KEY, new ZoomState())
}

export function getZoomState() {
  const zoomState = getContext<ReturnType<typeof setZoomState>>(ZOOM_KEY)

  if (!zoomState) {
    throw new Error('ZoomState is not set')
  }

  return zoomState
}
