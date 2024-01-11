import { DISPLAY_SCORE_MULTIPLIER } from './score.js'

export function formatTime(milliseconds: number) {
  const seconds = Math.round(milliseconds / 1000)
  const minutes = Math.floor(seconds / 60).toString()
  const secondsRemaining = seconds % 60

  return {
    minutes: minutes.toString(),
    seconds: secondsRemaining.toString().padStart(2, '0')
  }
}

export function formatScore(score: number) {
  return new Intl.NumberFormat().format(Math.round(score) * DISPLAY_SCORE_MULTIPLIER)
}
