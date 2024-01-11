import { DEFAULT_RADIUS } from 'ol/sphere.js'

import type { Submission, Ratios } from '$lib/shared/types.js'

const MAX_SCORE_MIN = 50
const MAX_SCORE_MAX = 100

export const DISPLAY_SCORE_MULTIPLIER = 100

// Size of city block in square meters
const AREA_MIN = 100 * 100

// Size of small country in square meters
const AREA_MAX = 25_000 * 1_000 * 1_000

const TIME_MIN = 5 * 1000
const TIME_MAX = 2 * 60 * 1000

const CIRCUMFERENCE = 2 * Math.PI * DEFAULT_RADIUS
const MAX_DISTANCE = CIRCUMFERENCE / 2
const MAX_ZOOM_DIFFERENCE = 8

function computeAreaRatio(area: number) {
  return (
    1 -
    Math.min(
      1,
      Math.max((Math.log(area) - Math.log(AREA_MIN)) / (Math.log(AREA_MAX) - Math.log(AREA_MIN)), 0)
    )
  )
}

function computeTimeRatio(time: number) {
  return 1 - Math.min(1, Math.max((time - TIME_MIN) / (TIME_MAX - TIME_MIN), 0))
}

function computeZoomRatio(submission: Submission) {
  const zoomDiff = Math.abs(submission.zoom.warpedMap - submission.zoom.submission)
  return 1 - Math.min(1, zoomDiff / MAX_ZOOM_DIFFERENCE)
}

function computeDistanceRatio(submission: Submission) {
  return 1 - Math.min(submission.distance / MAX_DISTANCE, 1)
}

export function computeScoreRatios(
  startTime: number,
  endTime: number,
  submission: Submission
): Ratios {
  const timeRatio = computeTimeRatio(endTime - startTime)
  const zoomRatio = computeZoomRatio(submission)
  const distanceRatio = computeDistanceRatio(submission)

  return {
    time: timeRatio,
    zoom: zoomRatio,
    distance: distanceRatio
  }
}

export function computeMaxScore(area: number) {
  return (MAX_SCORE_MAX - MAX_SCORE_MIN) * computeAreaRatio(area) + MAX_SCORE_MIN
}

export function computeScore(area: number, scoreRatios: Ratios) {
  const maxScore = computeMaxScore(area)
  const score = maxScore * scoreRatios.time * scoreRatios.zoom * scoreRatios.distance
  return score
}
