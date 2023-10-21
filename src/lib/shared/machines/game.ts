import { get } from 'svelte/store'
import { createMachine, assign, interpret, type EventObject } from 'xstate'
import { useSelector } from '@xstate/svelte'

import { fetchImageInfo } from '@allmaps/stdlib'
import { GCPTransformer } from '@allmaps/transform'

import { getRandomAnnotationUrl, fetchMap } from '$lib/shared/annotations.js'
import { computeScore } from '$lib/shared/score.js'
import { colorForRounds } from '$lib/shared/colors.js'

import { failedAnnotationUrls, addFailedAnnotationUrl } from '$lib/shared/stores/annotation-urls.js'

import type { Map } from '@allmaps/annotation'

import type OLMap from 'ol/Map.js'

import type { Round, LoadedRound, SubmittedRound, Rounds, Submission } from '$lib/shared/types.js'

const NUMBER_OF_ROUNDS = 5
// const DELAY_MS = 6000

type Context = {
  olImage?: OLMap
  olMap?: OLMap
  rounds: Rounds
}

type GameEvent =
  | { type: 'NEXT' }
  | { type: 'START' }
  | { type: 'SET_OL_IMAGE'; ol: OLMap }
  | { type: 'SET_OL_MAP'; ol: OLMap }
  | { type: 'SHOW_IMAGE' }
  | { type: 'SHOW_MAP' }
  | { type: 'SUBMIT'; endTime: number; submission: Submission }
  | { type: 'TICK' }

function getTime() {
  const date = new Date()
  return date.getTime()
}

function assignLastRound<T extends EventObject>(updateFn: (round: Round, event: T) => Round) {
  return assign({
    rounds: (context: Context, event: T) => {
      const lastRoundIndex = context.rounds.length - 1
      let lastRound = context.rounds[context.rounds.length - 1]
      lastRound = updateFn(lastRound, event)
      context.rounds[lastRoundIndex] = lastRound
      return context.rounds
    }
  })
}

export const machine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5RQIYFswDpYBcUCccBiAOQFEANAFQG0AGAXUVAAcB7WASx07YDtmIAB6IATAE4ALJlEAOcXQmTRougEZxANgA0IAJ6IAzJoCsmcQHZTFqYtN1DAX0e7UGTG7ABJPjnxtSSlpGQXYuHn5BEQQ1WTM6E0lNWTlDLVErC10DGLoFGSS1TVE1ZWNDNWdXdCx-AFc+CEwWfyh8OFhMABs2FAhOPigiCH4sAYA3NgBrLE9Mesbm1vbYTp6+gagECbYAYxQIvnoGY9CObl4BJGFEExtMC0VLSRtZZKtsxFkHcys78SkaiBciqIDmCyaLTYbQ6mAGfgC5Gop2uYQukWu0VkVkwhlUokMhkkeU0UhMnwQKTMkhMFWMok0NhUThcYJq8zYDSa-VgLC6KD0RAAymQqAB9ADyABkxV4ALIAQQA4mQUaxzocoohkoZMEDHlZVIlJHEKUC6LJMMTNBVZIYTAlJEDQeDOYseXyBcLRZKZYqAApqkBozWY7X5Co2wwWUTEpKMs3qNTmWlqCwWfXE8Qs6ruCGYD38vRwtAoGDCgASEoA6mKA0GQ5ctQgkpa0nbs4S0xlTfpEKV1HqaeI5GmLBUii72fnCwKS2WwMKAKoAITlXmCTFRGqbYYQGctpTtpMkyjydB0fZiZUwFs0DnveXtdAsU7zbu5nF5RcwpZYlZrWVFRVBsdwxUBohpXUAXEbE1AZIpxDUQwzRpZNNGHIlkPgkxkjfWoPwLL9PWLP9lzXDdQPCXcIMQKDzABOCENJZCzQycRcRMKRTDSHsTXw7A6jQUt8EFJFNzOajwJuGIbQeO5vg7bCCVkClZGTB06C0kxviQ-VX1ZOYAAtOCgIzYF2NgVkCZEQm3KSrlohATFECkiV1LStP1G0EgM1k+DYCA4EETxJPRRyZIAWkvHJooE3ACBwMLQyco1MBtDJJEsCpRAdbE3M0TQrT+BRswZWRTwEzwfARZKaJku5E3yCxCgyEwXIQgSITq6Toly0RMFpeQbCfFJNFYq9xukKC1BcgFxtkeQusIqEYVWHqIuiQwtMGwxhtKvaEJQq9HmTcRUx075aS0zRlq5JZoRWNZen6QYNubIlLSGywDrGiacgseQrVTDCpqdAk7sWVanrhXx-HevdActO07ha0pYjytTcpTCp1EZQHVEqQzpxW5ZYRIzYEacn7MG+GkJEKvbszUxRgbpLQMwdcRIchMnVkEgAjNBuBwSAqZkw69XOo92qJXKKopEc6BxoE9osWl00kHmiO-AVxa2hJdv20ajrNDRkziMlzuPcdtdnYtOFLGB9e1DRabGsbCSQqRUKSQbinGkw02G9S7eIn8-xdhB7V1b6RuzP7jpyUonRkR4pABaMUliMPdeLWA6iFkWxfs8Lm0WgatGxO57VbdRUOjdKaWGmxAfOkx4qEkScnVBzm2ULHb08tMvdKHSidzLATLMiyrOC0uUpkhkLAKEo6CSGkg7yNSzpg3K8kW8cIecRwgA */
    id: 'game',
    schema: {
      context: {} as Context,
      events: {} as GameEvent
    },
    context: {
      rounds: []
    },
    initial: 'start',
    states: {
      error: {
        on: {
          NEXT: {
            target: 'start'
          }
        }
      },
      start: {
        on: {
          NEXT: {
            target: 'gameIntro'
          }
        }
      },
      gameIntro: {
        on: {
          NEXT: {
            target: 'round'
          }
        }
      },
      round: {
        // id: 'round',
        type: 'parallel',
        states: {
          progress: {
            initial: 'loading',
            states: {
              loading: {
                entry: 'createRound',
                invoke: {
                  src: 'fetchRoundData',
                  onDone: {
                    target: 'intro',
                    actions: assignLastRound((round, event) => ({
                      ...round,
                      ...event.data
                    }))
                  },
                  onError: {
                    target: '#game.error'
                  }
                }
              },
              intro: {
                on: {
                  START: {
                    target: 'playing'
                  }
                }
              },
              playing: {
                entry: ['setStartTime'],
                on: {
                  SUBMIT: {
                    actions: ['computeScore'],
                    target: 'submitted'
                  }
                }
              },
              submitted: {
                on: {
                  NEXT: [
                    {
                      cond: 'playing',
                      target: 'loading'
                    },
                    {
                      target: '#game.summary'
                    }
                  ]
                }
              }
            }
          },
          display: {
            initial: 'image',
            states: {
              image: {
                on: {
                  SHOW_MAP: {
                    target: 'map'
                  }
                }
              },
              map: {
                on: {
                  SHOW_IMAGE: {
                    target: 'image'
                  }
                }
              }
            },
            on: {
              SET_OL_IMAGE: {
                actions: ['setOlImage']
              },
              SET_OL_MAP: {
                actions: ['setOlMap']
              }
            }
          }
        }
      },
      summary: {
        on: {
          NEXT: {
            target: 'highscores'
          }
        }
      },
      highscores: {
        on: {
          NEXT: {
            target: 'start',
            actions: 'resetRounds'
          }
        }
      }
    },
    predictableActionArguments: true,
    preserveActionOrder: true
  },
  {
    actions: {
      createRound: assign({
        rounds: (context) =>
          context.rounds.concat({
            loaded: false,
            submitted: false,
            score: 0,
            colors: colorForRounds[context.rounds.length]
          })
      }),
      resetRounds: assign({
        rounds: []
      }),
      setStartTime: assignLastRound((round) => {
        if (round.loaded) {
          round.startTime = getTime()
        }

        return round
      }),
      computeScore: assignLastRound((round, event) => {
        if (round.loaded && event.type === 'SUBMIT') {
          return {
            ...round,
            endTime: event.endTime,
            submission: event.submission,
            score: computeScore(round.startTime, event.endTime, event.submission),
            submitted: true
          }
        }

        return round
      }),
      setOlImage: assign({
        olImage: (context, event) => (event.type === 'SET_OL_IMAGE' ? event.ol : undefined)
      }),
      setOlMap: assign({
        olMap: (context, event) => (event.type === 'SET_OL_MAP' ? event.ol : undefined)
      })
    },
    services: {
      fetchRoundData: async (context): Promise<Partial<LoadedRound>> => {
        let annotationUrl: string | undefined
        let map: Map | undefined
        let transformer: GCPTransformer | undefined
        let imageInfo: unknown | undefined

        const maxTries = 5
        let tries = 0
        let success = false

        while (!success && tries < maxTries) {
          const previousAnnotationUrls = [
            ...context.rounds
              .filter((round): round is LoadedRound => round.loaded)
              .map((round) => round.annotationUrl),
            ...get(failedAnnotationUrls)
          ]

          annotationUrl = getRandomAnnotationUrl(previousAnnotationUrls)

          if (annotationUrl) {
            try {
              map = await fetchMap(annotationUrl)
              transformer = new GCPTransformer(map.gcps)
              imageInfo = await fetchImageInfo(map.resource.id)
              success = true
            } catch (err) {
              console.warn('Failed to load annotation', annotationUrl)
            }
          }

          addFailedAnnotationUrl(annotationUrl)
          tries++
        }

        if (success) {
          return {
            loaded: true,
            startTime: 0,
            annotationUrl,
            map,
            transformer,
            imageInfo
          }
        } else {
          // TODO: handle error
          throw new Error('Failed to load annotation')
        }
      }
    },
    guards: { playing: (context) => context.rounds.length < NUMBER_OF_ROUNDS },
    delays: {}
  }
)

export const gameService = interpret(machine).start()

export const rounds = useSelector(gameService, (state) => state.context.rounds)

export const currentRoundIndex = useSelector(gameService, (state) =>
  state.context.rounds.length >= 0 ? state.context.rounds.length - 1 : undefined
)

export const currentRoundNumber = useSelector(gameService, (state) =>
  state.context.rounds.length > 0 ? state.context.rounds.length : undefined
)

export const currentRound = useSelector(gameService, (state) => {
  if (state.context.rounds.length > 0) {
    return state.context.rounds[state.context.rounds.length - 1]
  }
})

export const isLastRound = useSelector(
  gameService,
  (state) => state.context.rounds.length === NUMBER_OF_ROUNDS
)

export const score = useSelector(gameService, (state) =>
  state.context.rounds
    .filter((round): round is SubmittedRound => round.submitted)
    .reduce((acc, round) => acc + round.score, 0)
)

export const olTarget = useSelector(gameService, (state) => {
  let target: HTMLElement | string | undefined

  if (state.matches('round.display.image')) {
    target = state.context.olImage?.getTarget()
  } else if (state.matches('round.display.map')) {
    target = state.context.olMap?.getTarget()
  }

  // HTMLElement does not exist when not in browser
  // check if not string instead
  if (typeof target !== 'string') {
    return target
  }
})
