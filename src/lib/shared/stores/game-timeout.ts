import { writable, derived, get } from 'svelte/store'

import { gameService } from '$lib/shared/machines/game.js'

import { GAME_TIMEOUT_MS, GAME_TIMEOUT_WARNING_MS } from '$lib/shared/constants.js'

let intervalId: number | undefined

export const lastInteraction = writable<Date>(new Date())
export const showGameTimeoutWarning = writable<boolean>(false)

function tick() {
  const $gameDuration = get(gameDuration)
  if ($gameDuration > GAME_TIMEOUT_MS) {
    resetLastInteraction()
    gameService.send('TIMEOUT')
  }

  if ($gameDuration > GAME_TIMEOUT_MS - GAME_TIMEOUT_WARNING_MS && intervalId !== undefined) {
    showGameTimeoutWarning.set(true)
  }
}

export function startGameTimeout() {
  if (intervalId === undefined) {
    intervalId = setInterval(tick, 1000)
  }
}

export function stopGameTimeout() {
  if (intervalId !== undefined) {
    resetLastInteraction()
    clearInterval(intervalId)
    intervalId = undefined
  }
}

export function resetLastInteraction() {
  showGameTimeoutWarning.set(false)
  lastInteraction.set(new Date())
}

export const gameDuration = derived(lastInteraction, ($lastInteraction) => {
  const now = new Date()
  return now.getTime() - $lastInteraction.getTime()
})
