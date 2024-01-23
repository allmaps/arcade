import type { Configuration, Submission, Ratios } from '$lib/shared/types.js'

// const MAX_SCORE_MIN = 50
// const MAX_SCORE_MAX = 100

// // Size of city block in square meters
// const AREA_MIN = 100 * 100

// // Size of small country in square meters
// const AREA_MAX = 25_000 * 1_000 * 1_000

// const TIME_MIN = 5
// const TIME_MAX = 5 * 60

// const CIRCUMFERENCE = 2 * Math.PI * DEFAULT_RADIUS
// const MAX_DISTANCE = CIRCUMFERENCE / 2
// const MAX_ZOOM_DIFFERENCE = 8

function computeAreaRatio(configuration: Configuration, area: number) {
  const areaMin = configuration.score.area.min
  const areaMax = configuration.score.area.max

  return (
    1 -
    Math.min(
      1,
      Math.max((Math.log(area) - Math.log(areaMin)) / (Math.log(areaMax) - Math.log(areaMin)), 0)
    )
  )
}

function computeTimeRatio(configuration: Configuration, timeMs: number) {
  const timeMin = configuration.score.time.min
  const timeMax = configuration.score.time.max

  const timeSeconds = timeMs / 1000
  return 1 - Math.min(1, Math.max((timeSeconds - timeMin) / (timeMax - timeMin), 0))
}

function computeZoomRatio(configuration: Configuration, submission: Submission) {
  const maxZoomDifference = configuration.score.maxZoomDifference

  const zoomDiff = Math.abs(submission.zoom.warpedMap - submission.zoom.submission)
  return 1 - Math.min(1, zoomDiff / maxZoomDifference)
}

function computeDistanceRatio(
  configuration: Configuration,
  geoMaskArea: number,
  submission: Submission
) {
  const maxWarpedMapDistance = configuration.score.maxWarpedMapDistance

  const geoMaskSize = Math.sqrt(geoMaskArea)
  const warpedMapDistance = submission.distance / geoMaskSize

  // TODO: don't make distance ratio linear?
  return 1 - Math.min(warpedMapDistance / maxWarpedMapDistance, 1)
}

export function computeScoreRatios(
  configuration: Configuration,
  startTimeMs: number,
  endTimeMs: number,
  geoMaskArea: number,
  submission: Submission
): Ratios {
  const timeRatio = computeTimeRatio(configuration, endTimeMs - startTimeMs)
  const zoomRatio = computeZoomRatio(configuration, submission)
  const distanceRatio = computeDistanceRatio(configuration, geoMaskArea, submission)

  return {
    time: timeRatio,
    zoom: zoomRatio,
    distance: distanceRatio
  }
}

export function computeMaxScore(configuration: Configuration, area: number) {
  const maxScoreMin = configuration.score.maxScore.min
  const maxScoreMax = configuration.score.maxScore.max

  return (maxScoreMax - maxScoreMin) * computeAreaRatio(configuration, area) + maxScoreMin
}

export function computeScore(configuration: Configuration, area: number, scoreRatios: Ratios) {
  const maxScore = computeMaxScore(configuration, area)
  const score = maxScore * scoreRatios.time * scoreRatios.zoom * scoreRatios.distance
  return score
}
