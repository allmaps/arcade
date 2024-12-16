import type { Configuration } from '$lib/shared/types.js'

type Division = {
  amount: number
  name: Intl.RelativeTimeFormatUnit
}

const divisions: Division[] = [
  { amount: 60, name: 'seconds' },
  { amount: 60, name: 'minutes' },
  { amount: 24, name: 'hours' },
  { amount: 7, name: 'days' },
  { amount: 4.34524, name: 'weeks' },
  { amount: 12, name: 'months' },
  { amount: Number.POSITIVE_INFINITY, name: 'years' }
]

export function formatTimeAgo(date: Date) {
  const formatter = new Intl.RelativeTimeFormat(undefined, {
    numeric: 'auto'
  })

  // From https://blog.webdevsimplified.com/2020-07/relative-time-format/
  let duration = (date.getTime() - new Date().getTime()) / 1000
  for (let i = 0; i <= divisions.length; i++) {
    const division = divisions[i]
    if (Math.abs(duration) < division.amount) {
      return formatter.format(Math.round(duration), division.name)
    }
    duration /= division.amount
  }
}

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
