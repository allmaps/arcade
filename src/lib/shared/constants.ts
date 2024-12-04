import type { Padding } from '$lib/shared/types.js'

export const WARPED_MAP_BEHIND_LABELS = false

export const HIGHSCORE_DISPLAY_COUNT = 10

export const NUMBER_OF_ROUNDS = 5

export const AUTO_ADVANCE_MS = 10 * 1_000

export const EXPLAIN_STEP_MS = 2 * 1_000
export const RESULTS_ROUND_MS = 8 * 1_000

export const GAME_TIMEOUT_MS = 1.5 * 60 * 1_000
export const GAME_TIMEOUT_WARNING_MS = 30 * 1_000

export const MIN_LOADING_MS = 1 * 1_000

// OpenStreetMap atrribution should be shown at least 5 seconds
// https://osmfoundation.org/wiki/Licence/Attribution_Guidelines#Interactive_maps
export const ATTRIBUTION_MIN_MS = 5 * 1_000

// Padding (in pixels) to be cleared inside the view.
// Values in the array are top, right, bottom and left padding.
export const PADDING = [100, 30, 120, 30] as Padding

export const MAPLIBRE_PADDING = {
  top: PADDING[0],
  bottom: PADDING[2],
  left: PADDING[3],
  right: PADDING[1]
}
