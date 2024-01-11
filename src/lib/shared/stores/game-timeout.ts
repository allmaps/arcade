import { writable, derived, get } from 'svelte/store'

import { gameService } from '$lib/shared/machines/game.js'

import { GAME_TIMEOUT_MS } from '$lib/shared/constants.js'

export const lastInteraction = writable<Date>(new Date())

export const resetLastInteraction = () => lastInteraction.set(new Date())

export const gameDuration = derived(lastInteraction, ($lastInteraction) => {
  const now = new Date()
  return now.getTime() - $lastInteraction.getTime()
})

setInterval(() => {
  if (get(gameDuration) > GAME_TIMEOUT_MS) {
    resetLastInteraction()
    gameService.send('TIMEOUT')
  }
}, 1000)
