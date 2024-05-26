import { get, derived } from 'svelte/store'
import { createMachine, createActor, assign, fromPromise, raise } from 'xstate'
import { useSelector } from '@xstate/svelte'

import { getArea } from 'ol/sphere.js'
import GeoJSON from 'ol/format/GeoJSON.js'

import { fetchImageInfo } from '@allmaps/stdlib'
import { GcpTransformer } from '@allmaps/transform'

import { getConfiguration } from '$lib/shared/config.js'
import { fetchMap } from '$lib/shared/maps.js'
import { computeScoreRatios, computeMaxScore, computeScore } from '$lib/shared/score.js'
import { colorForRounds } from '$lib/shared/colors.js'
import defaultConfig from '$lib/shared/default-config.js'
import { getTimeoutSignal } from '$lib/shared/timeout.js'

import {
  failedAnnotationUrls,
  addFailedAnnotationUrl,
  resetFailedAnnotationUrls
} from '$lib/shared/stores/failed-annotation-urls.js'

import { environment } from '$lib/shared/stores/environment'
import { startGameTimeout, stopGameTimeout } from '$lib/shared/stores/game-timeout.js'
import { assignLastRound } from '$lib/shared/xstate.js'
import { NUMBER_OF_ROUNDS } from '$lib/shared/constants.js'

import type { Map } from '@allmaps/annotation'
import type { GeojsonPolygon } from '@allmaps/types'

import type {
  Context,
  GameEvent,
  Rounds,
  LoadedRound,
  SubmittedRound,
  Configuration,
  MappingLibrary
} from '$lib/shared/types.js'

function getTime() {
  const date = new Date()
  return date.getTime()
}

export const machine = createMachine(
  {
    id: 'game',
    types: {
      context: {} as Context,
      events: {} as GameEvent
    },
    context: {
      rounds: [] as Rounds,
      configuration: defaultConfig,
      error: undefined
    },
    initial: 'loading',
    on: {
      TIMEOUT: {
        target: '.title'
      }
    },
    states: {
      loading: {
        invoke: {
          src: 'getConfiguration',
          onDone: {
            target: 'title',
            actions: assign({
              configuration: ({ event }) => event.output
            })
          }
        }
      },
      error: {
        on: {
          NEXT: {
            target: 'title'
          }
        }
      },
      title: {
        entry: ['resetRounds', 'stopGameTimeout'],
        exit: ['startGameTimeout'],
        on: {
          NEXT: {
            target: 'explain'
          }
        }
      },
      explain: {
        on: {
          NEXT: {
            target: 'round'
          }
        }
      },
      round: {
        id: 'round',
        type: 'parallel',
        entry: 'callGameStart',
        states: {
          progress: {
            initial: 'loading',
            states: {
              loading: {
                entry: ['createRound', raise({ type: 'SHOW_IMAGE' })],
                invoke: {
                  src: 'fetchRoundData',
                  input: ({ context }) => ({
                    rounds: context.rounds,
                    configuration: context.configuration
                  }),
                  onDone: {
                    target: 'intro',
                    actions: assignLastRound((round, event) => ({
                      ...round,
                      ...event.output
                    }))
                  },
                  onError: {
                    target: '#game.error',
                    actions: assign({
                      error: ({ event }) => {
                        if (event.error instanceof Error) {
                          return event.error
                        } else {
                          return new Error('Unknown error')
                        }
                      }
                    })
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
                entry: ['setStartTime', raise({ type: 'SHOW_MAP' })],
                on: {
                  MAP_MOVED: {
                    actions: assignLastRound((round) => ({
                      ...round,
                      canSubmit: true
                    }))
                  },
                  SUBMIT: {
                    guard: 'canSubmit',
                    actions: 'computeScore',
                    target: 'submitted'
                  }
                }
              },
              submitted: {
                initial: 'animating',
                states: {
                  animating: {
                    on: {
                      FINISHED: {
                        target: 'score'
                      }
                    }
                  },
                  score: {
                    on: {
                      MAP_MOVED: {
                        target: 'review'
                      }
                    }
                  },
                  review: {}
                },
                on: {
                  NEXT: [
                    {
                      guard: 'playing',
                      target: 'loading'
                    },
                    {
                      target: '#game.results'
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
              SET_IMAGE_KEYBOARD_TARGET: {
                actions: 'setImageKeyboardTarget'
              },
              SET_MAP_KEYBOARD_TARGET: {
                actions: 'setMapKeyboardTarget'
              }
            }
          }
        }
      },
      results: {
        initial: 'score',
        exit: 'callGameEnd',
        states: {
          score: {},
          review: {}
        },
        on: {
          SET_IMAGE_KEYBOARD_TARGET: {
            actions: ['setImageKeyboardTarget']
          },
          SET_MAP_KEYBOARD_TARGET: {
            actions: ['setMapKeyboardTarget']
          },
          NEXT: {
            target: 'title'
          }
        }
      }
    }
  },
  {
    actions: {
      createRound: assign({
        rounds: ({ context }) =>
          context.rounds.concat({
            index: context.rounds.length,
            number: context.rounds.length + 1,
            loaded: false,
            submitted: false,
            score: 0,
            colors: colorForRounds[context.rounds.length]
          })
      }),
      // resetFailedAnnotationUrls
      resetRounds: assign({
        rounds: () => {
          resetFailedAnnotationUrls()
          return []
        }
      }),
      startGameTimeout: () => {
        const $environment = get(environment)
        if ($environment.timeoutEnabled) {
          startGameTimeout()
        }
      },
      stopGameTimeout: () => stopGameTimeout(),
      setStartTime: assignLastRound((round) => {
        if (round.loaded) {
          round.startTime = getTime()
        }

        return round
      }),
      computeScore: assignLastRound((round, event, context) => {
        if (round.loaded && event.type === 'SUBMIT') {
          const scoreRatios = computeScoreRatios(
            context.configuration,
            round.startTime,
            event.endTime,
            round.area,
            event.submission
          )
          return {
            ...round,
            endTime: Math.max(round.startTime, event.endTime),
            submission: event.submission,
            score: computeScore(context.configuration, round.area, scoreRatios),
            scoreRatios,
            submitted: true
          }
        }

        return round
      }),
      setImageKeyboardTarget: assign({
        imageKeyboardTarget: ({ event }) =>
          event.type === 'SET_IMAGE_KEYBOARD_TARGET'
            ? { element: event.element, library: event.library }
            : undefined
      }),
      setMapKeyboardTarget: assign({
        mapKeyboardTarget: ({ event }) =>
          event.type === 'SET_MAP_KEYBOARD_TARGET'
            ? { element: event.element, library: event.library }
            : undefined
      }),
      callGameStart: () => {
        const $environment = get(environment)
        if ($environment) {
          $environment.onGameStart?.()
        }
      },
      callGameEnd: () => {
        const $environment = get(environment)
        if ($environment) {
          $environment.onGameEnd?.()
        }
      }
    },
    actors: {
      getConfiguration: fromPromise(async (): Promise<Configuration> => getConfiguration()),
      fetchRoundData: fromPromise(
        async ({
          input
        }: {
          input: { rounds: Rounds; configuration: Configuration }
        }): Promise<Partial<LoadedRound>> => {
          let annotationUrl: string | undefined
          let map: Map | undefined
          let transformer: GcpTransformer | undefined
          let imageInfo: unknown | undefined
          let geoMask: GeojsonPolygon | undefined
          let area: number | undefined
          let maxScore: number | undefined

          const maxTries = 5
          let tries = 0
          let success = false

          const $environment = get(environment)

          while (!success && tries < maxTries) {
            const previousAnnotationUrls = [
              ...input.rounds
                .filter((round): round is LoadedRound => round.loaded)
                .map((round) => round.annotationUrl),
              ...get(failedAnnotationUrls)
            ].filter((url) => url)

            annotationUrl = await $environment.getRandomAnnotationUrl(
              input.configuration,
              previousAnnotationUrls
            )

            if (annotationUrl) {
              try {
                map = await fetchMap(annotationUrl, getTimeoutSignal())
                transformer = new GcpTransformer(map.gcps)
                imageInfo = await fetchImageInfo(map.resource.id, getTimeoutSignal())

                geoMask = transformer.transformToGeoAsGeojson([map.resourceMask])
                area = getArea(
                  new GeoJSON().readGeometry(geoMask, {
                    dataProjection: 'EPSG:4326',
                    featureProjection: 'EPSG:3857'
                  })
                )

                maxScore = computeMaxScore(input.configuration, area)

                success = true
              } catch (err) {
                console.warn('Failed to load annotation', annotationUrl, err)
                addFailedAnnotationUrl(annotationUrl)
              }
            }

            tries++
          }

          if (success) {
            return {
              loaded: true,
              canSubmit: false,
              startTime: 0,
              annotationUrl,
              map,
              transformer,
              imageInfo,
              geoMask,
              area,
              maxScore
            }
          } else {
            // TODO: handle error. Maybe load new annotation?
            throw new Error('Failed to load annotation')
          }
        }
      )
    },
    guards: {
      playing: ({ context }: { context: Context }) => context.rounds.length < NUMBER_OF_ROUNDS,
      canSubmit: ({ context }: { context: Context }) => {
        const lastRound = context.rounds[context.rounds.length - 1]
        return lastRound.loaded && lastRound.canSubmit
      }
    }
  }
)

export const actor = createActor(machine).start()

export type Snapshot = ReturnType<typeof actor.getSnapshot>

export const state = useSelector(actor, (state) => state)

export const configuration = useSelector(actor, (state) => state.context.configuration)

export const rounds = useSelector(actor, (state) => state.context.rounds)

export const error = useSelector(actor, (state) => state.context.error)

export const currentRound = useSelector(actor, (state) => {
  if (state.context.rounds.length > 0) {
    return state.context.rounds[state.context.rounds.length - 1]
  }
})

export const currentRoundIndex = derived(currentRound, ($currentRound) => $currentRound?.index)

export const currentRoundNumber = derived(currentRound, ($currentRound) => $currentRound?.number)

export const isLastRound = useSelector(
  actor,
  (state) => state.context.rounds.length === NUMBER_OF_ROUNDS
)

export const score = useSelector(actor, (state) =>
  state.context.rounds
    .filter((round): round is SubmittedRound => round.submitted)
    .reduce((acc, round) => acc + round.score, 0)
)

export const keyboardTarget = useSelector(actor, (state) => {
  if (state.matches('round.display.image')) {
    return state.context.imageKeyboardTarget
  } else {
    // in states 'round.display.map' and 'results'
    return state.context.mapKeyboardTarget
  }
})
