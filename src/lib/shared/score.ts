import { HIGHSCORE_DISPLAY_COUNT } from '$lib/shared/constants.js'

import type {
  Context,
  ArcadeEnvironment,
  SubmittedRound,
  Configuration,
  Submission,
  Ratios,
  Highscore
} from '$lib/shared/types.js'

export function getHighscoresEnabled(environment: ArcadeEnvironment) {
  return environment.getHighscores !== undefined && environment.saveHighscore !== undefined
}

export function isHighscore(highscores: Highscore[], score: number) {
  if (Math.floor(score) === 0) {
    return false
  }

  if (highscores.length < HIGHSCORE_DISPLAY_COUNT) {
    return true
  }

  for (const highscore of highscores
    .toSorted((a, b) => a.score - b.score)
    .slice(0, HIGHSCORE_DISPLAY_COUNT)) {
    if (score > highscore.score) {
      return true
    }
  }

  return false
}

export function computeTotalScore(context: Context) {
  return context.rounds
    .filter((round): round is SubmittedRound => round.submitted)
    .reduce((acc, round) => acc + round.score, 0)
}

export function computeAreaRatio(configuration: Configuration, area: number) {
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

export function computeTimeRatio(configuration: Configuration, timeMs: number) {
  const timeMin = configuration.score.time.min
  const timeMax = configuration.score.time.max

  const timeSeconds = timeMs / 1000
  // TODO: time ratio should not be linear
  return 1 - Math.min(1, Math.max((timeSeconds - timeMin) / (timeMax - timeMin), 0))
}

export function computeZoomRatio(submission: Pick<Submission, 'zoom'>) {
  const zoomDiff = Math.abs(submission.zoom.warpedMap - submission.zoom.submission)
  // TODO: turn constants into configuration variables

  // How higher d, how smaller the influence of zoomDiff on the score
  // TODO: d should be higher for small-area maps
  const d = 2
  return 1 / (1 + (zoomDiff / d) ** 2)
}

export function computeDistanceRatio(
  geoMaskArea: number,
  submission: Pick<Submission, 'distance'>
) {
  const geoMaskSize = Math.sqrt(geoMaskArea)
  const warpedMapDistance = submission.distance / geoMaskSize
  // TODO: turn constants into configuration variables

  // How higher d, how smaller the influence of warpedMapDistance on the score
  // TODO: d should be high for small-area maps
  const d = 4

  return 1 / (1 + warpedMapDistance / d)
}

export function computeScoreRatios(
  configuration: Configuration,
  startTimeMs: number,
  endTimeMs: number,
  geoMaskArea: number,
  submission: Submission
): Ratios {
  const timeRatio = computeTimeRatio(configuration, endTimeMs - startTimeMs)
  const zoomRatio = computeZoomRatio(submission)
  const distanceRatio = computeDistanceRatio(geoMaskArea, submission)

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
