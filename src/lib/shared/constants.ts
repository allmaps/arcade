import type { Padding } from './types.js'

export const NUMBER_OF_ROUNDS = 5

export const AUTO_ADVANCE_MS = 10 * 1_000

export const GAME_TIMEOUT_MS = 1.5 * 60 * 1_000
export const GAME_TIMEOUT_WARNING_MS = 30 * 1_000

export const MIN_LOADING_MS = 2 * 1_000

// Padding (in pixels) to be cleared inside the view.
// Values in the array are top, right, bottom and left padding.
export const PADDING = [100, 30, 120, 30] as Padding
