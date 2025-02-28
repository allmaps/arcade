import { setContext, getContext } from 'svelte'
import { derived } from 'svelte/store'

import { useSelector } from '@xstate/svelte'

import { computeTotalScore, getHighscoresEnabled, isHighscore } from '$lib/shared/score.js'

import type { Readable } from 'svelte/store'

import type { SnapshotFrom, EventFromLogic, Actor } from 'xstate'

import type { GameMachine } from '$lib/shared/machines/game.js'

import type { Highscore, Round } from '$lib/shared/types.js'

import { NUMBER_OF_ROUNDS } from '$lib/shared/constants.js'

const SNAPSHOT_KEY = Symbol('snapshot')

export class SnapshotState {
  #snapshot: Readable<SnapshotFrom<GameMachine>>
  #send: (event: EventFromLogic<GameMachine>) => void
  #actorRef: Actor<GameMachine>

  #error: Readable<Error | undefined>

  #rounds: Readable<Round[]>
  #currentRound: Readable<Round | undefined>
  #currentRoundIndex: Readable<number | undefined>
  #currentRoundNumber: Readable<number | undefined>
  #isLastRound: Readable<boolean>

  #totalScore: Readable<number>

  #highscores: Readable<Highscore[]>
  #lastHighscore: Readable<Highscore | undefined>
  #highscoresEnabled: Readable<boolean>
  #isNewHighscore: Readable<boolean>

  #keyboardTarget: Readable<
    { element: HTMLElement; library: 'maplibre' | 'openlayers' } | undefined
  >

  constructor(
    snapshot: Readable<SnapshotFrom<GameMachine>>,
    send: (event: EventFromLogic<GameMachine>) => void,
    actorRef: Actor<GameMachine>
  ) {
    this.#snapshot = snapshot
    this.#send = send
    this.#actorRef = actorRef

    this.#error = useSelector(this.#actorRef, (state) => state.context.error)

    this.#rounds = useSelector(this.#actorRef, (state) => state.context.rounds)
    this.#currentRound = useSelector(this.#actorRef, (state) => {
      if (state.context.rounds.length > 0) {
        return state.context.rounds[state.context.rounds.length - 1]
      }
    })

    this.#currentRoundIndex = derived(this.#currentRound, ($currentRound) => $currentRound?.index)
    this.#currentRoundNumber = derived(this.#currentRound, ($currentRound) => $currentRound?.number)

    this.#isLastRound = useSelector(
      this.#actorRef,
      (state) => state.context.rounds.length === NUMBER_OF_ROUNDS
    )

    this.#totalScore = useSelector(this.#actorRef, (state) => computeTotalScore(state.context))

    this.#highscores = useSelector(this.#actorRef, (snapshot) => snapshot.context.highscores)
    this.#lastHighscore = useSelector(this.#actorRef, (state) => state.context.lastHighscore)
    this.#highscoresEnabled = useSelector(
      this.#actorRef,
      (state) => state.context.environment && getHighscoresEnabled(state.context.environment)
    )
    this.#isNewHighscore = derived(
      [this.#highscores, this.#totalScore],
      ([$highscores, $totalScore]) => isHighscore($highscores, $totalScore)
    )

    this.#keyboardTarget = useSelector(this.#actorRef, (state) => {
      if (state.matches('round.display.image')) {
        return state.context.imageKeyboardTarget
      } else {
        // in states 'round.display.map' and 'results'
        return state.context.mapKeyboardTarget
      }
    })
  }

  get snapshot() {
    return this.#snapshot
  }

  get send() {
    return this.#send
  }

  get actorRef() {
    return this.#actorRef
  }

  get error() {
    return this.#error
  }

  get rounds() {
    return this.#rounds
  }

  get currentRound() {
    return this.#currentRound
  }

  get currentRoundIndex() {
    return this.#currentRoundIndex
  }

  get currentRoundNumber() {
    return this.#currentRoundNumber
  }

  get isLastRound() {
    return this.#isLastRound
  }

  get totalScore() {
    return this.#totalScore
  }

  get highscores() {
    return this.#highscores
  }

  get lastHighscore() {
    return this.#lastHighscore
  }

  get highscoresEnabled() {
    return this.#highscoresEnabled
  }

  get isNewHighscore() {
    return this.#isNewHighscore
  }

  get keyboardTarget() {
    return this.#keyboardTarget
  }
}

export function setSnapshotState(
  snapshot: Readable<SnapshotFrom<GameMachine>>,
  send: (event: EventFromLogic<GameMachine>) => void,
  actorRef: Actor<GameMachine>
) {
  return setContext(SNAPSHOT_KEY, new SnapshotState(snapshot, send, actorRef))
}

export function getSnapshotState() {
  const snapshotState = getContext<ReturnType<typeof setSnapshotState>>(SNAPSHOT_KEY)

  if (!snapshotState) {
    throw new Error('SnapshotState is not set')
  }

  return snapshotState
}
