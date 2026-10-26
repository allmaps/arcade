import { getContext, setContext } from 'svelte'

import type { Map } from 'maplibre-gl'
import type { MapControls } from '$lib/shared/map-controls.js'

type View = 'image' | 'map' | 'results'

const MAP_CONTROLS_KEY = Symbol('map-controls')

export class MapControlsState {
  #views = $state.raw<Partial<Record<View, MapControls>>>({})
  #bearings = $state<Partial<Record<View, number>>>({})
  #activeView = $state<View>('image')

  get bearing() {
    return this.#bearings[this.#activeView] ?? 0
  }

  get activeControls() {
    return this.#views[this.#activeView]
  }

  activate(view: View) {
    this.#activeView = view
    this.activeControls?.focus()
  }

  register(view: View, map: Map, controls: MapControls) {
    this.#views = { ...this.#views, [view]: controls }
    this.#bearings[view] = map.getBearing()

    const updateBearing = () => {
      if (this.#views[view] === controls) this.#bearings[view] = map.getBearing()
    }
    map.on('rotate', updateBearing)

    return () => {
      map.off('rotate', updateBearing)
      if (this.#views[view] === controls) {
        this.#views = { ...this.#views, [view]: undefined }
        delete this.#bearings[view]
      }
    }
  }
}

export function setMapControlsState() {
  return setContext(MAP_CONTROLS_KEY, new MapControlsState())
}

export function getMapControlsState() {
  const state = getContext<MapControlsState>(MAP_CONTROLS_KEY)
  if (!state) throw new Error('MapControlsState is not set')
  return state
}
