import { setContext, getContext } from 'svelte'

import { GAME_TIMEOUT_MS, GAME_TIMEOUT_WARNING_MS } from '$lib/shared/constants.js'

const GAME_TIMEOUT_KEY = Symbol('game-timeout')

export class GameTimeoutState extends EventTarget {
  #intervalId: number | undefined

  #timedOut = $state<boolean>(false)
  #lastInteraction = $state<Date>(new Date())
  #showGameTimeoutWarning = $state<boolean>(false)

  #gameDuration = $derived.by(() => {
    const now = new Date()
    return now.getTime() - this.#lastInteraction.getTime()
  })

  #tick() {
    if (this.#gameDuration > GAME_TIMEOUT_MS) {
      this.resetLastInteraction()
      this.#timedOut = true
      this.dispatchEvent(new CustomEvent('timeout'))
    }

    if (
      this.#gameDuration > GAME_TIMEOUT_MS - GAME_TIMEOUT_WARNING_MS &&
      this.#intervalId !== undefined
    ) {
      this.#showGameTimeoutWarning = true
    }
  }

  startGameTimeout() {
    if (this.#intervalId === undefined) {
      this.#intervalId = setInterval(this.#tick, 1000)
    }
  }

  stopGameTimeout() {
    if (this.#intervalId !== undefined) {
      this.#timedOut = false
      this.resetLastInteraction()
      clearInterval(this.#intervalId)
      this.#intervalId = undefined
    }
  }

  resetLastInteraction() {
    this.#showGameTimeoutWarning = false
    this.#lastInteraction = new Date()
  }

  get showGameTimeoutWarning() {
    return this.#showGameTimeoutWarning
  }

  get timedOut() {
    return this.#timedOut
  }

  get enabled() {
    return this.#intervalId !== undefined
  }
}

export function setGameTimeoutState() {
  return setContext(GAME_TIMEOUT_KEY, new GameTimeoutState())
}

export function getGameTimeoutState() {
  const gameTimeoutState = getContext<ReturnType<typeof setGameTimeoutState>>(GAME_TIMEOUT_KEY)

  if (!gameTimeoutState) {
    throw new Error('GameTimeoutState is not set')
  }

  return gameTimeoutState
}
