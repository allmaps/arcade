import { setContext, getContext } from 'svelte'

const TIMER_KEY = Symbol('timer')

// TODO: is this class/file really needed? Can't we add this to state machine?

export class TimerState {
  #endTime = $state(0)

  get endTime() {
    return this.#endTime
  }

  set endTime(endTime: number) {
    this.#endTime = endTime
  }
}

export function setTimerState() {
  return setContext(TIMER_KEY, new TimerState())
}

export function getTimerState() {
  const timerState = getContext<ReturnType<typeof setTimerState>>(TIMER_KEY)

  if (!timerState) {
    throw new Error('TimerState is not set')
  }

  return timerState
}
