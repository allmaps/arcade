import type { Configuration } from '$lib/shared/types.js'

export function formatTime(milliseconds: number) {
  const seconds = Math.round(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60).toString()
  const secondsRemaining = seconds % 60

  return {
    minutes: minutes.toString(),
    seconds: secondsRemaining.toString().padStart(2, '0')
  }
}

export function formatDistance(distanceMeters: number) {
  if (distanceMeters < 1000) {
    return Math.round(distanceMeters) + ' m'
  } else {
    return Math.round(distanceMeters / 1000) + ' km'
  }
}

export function formatPercentage(ratio: number) {
  return new Intl.NumberFormat().format(Math.round(ratio * 1000) / 10) + '%'
}

export function formatScore(configuration: Configuration, score: number) {
  return new Intl.NumberFormat().format(
    Math.round(score) * configuration.score.displayScoreMultiplier
  )
}
