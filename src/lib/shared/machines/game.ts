import { get, derived } from 'svelte/store'
import { createMachine, createActor, assign, fromPromise, raise } from 'xstate'
import { useSelector } from '@xstate/svelte'

import { getArea } from 'ol/sphere.js'
import GeoJSON from 'ol/format/GeoJSON.js'

import { fetchImageInfo } from '@allmaps/stdlib'
import { GcpTransformer } from '@allmaps/transform'

import { getConfiguration } from '$lib/shared/config.js'
import { fetchMap } from '$lib/shared/maps.js'
import {
  computeTotalScore,
  computeScoreRatios,
  computeMaxScore,
  computeScore,
  getHighscoresEnabled,
  isHighscore
} from '$lib/shared/score.js'
import { colorForRounds } from '$lib/shared/colors.js'
import defaultConfig from '$lib/shared/default-config.js'
import { getTimeoutSignal } from '$lib/shared/timeout.js'
import { assignLastRound } from '$lib/shared/xstate.js'
import { NUMBER_OF_ROUNDS } from '$lib/shared/constants.js'

import {
  failedAnnotationUrls,
  addFailedAnnotationUrl,
  resetFailedAnnotationUrls
} from '$lib/shared/stores/failed-annotation-urls.js'
import { environment } from '$lib/shared/stores/environment'
import { startGameTimeout, stopGameTimeout } from '$lib/shared/stores/game-timeout.js'

import type { Map } from '@allmaps/annotation'
import type { GeojsonPolygon } from '@allmaps/types'

import type {
  Context,
  GameEvent,
  Rounds,
  LoadedRound,
  Configuration,
  ArcadeEnvironment,
  Highscore
} from '$lib/shared/types.js'

function getTime() {
  const date = new Date()
  return date.getTime()
}

export const machine = createMachine(
  {
    /** @xstate-layout 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-0DsUDYOg8yKFnB08BtYjBFl4RK62ttGJgD+YC-VfcDbyuypUJVdD2gTzNeCXWhpTCmCAA */
    id: 'game',
    types: {
      context: {} as Context,
      events: {} as GameEvent
    },
    context: {
      rounds: [] as Rounds,
      configuration: defaultConfig,
      environment: get(environment),
      highscores: []
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
        invoke: {
          src: 'getHighscores',
          input: ({ context }) => ({
            environment: context.environment
          }),
          onDone: {
            actions: assign({
              highscores: ({ event }) => event.output
            })
          }
        },
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
                    configuration: context.configuration,
                    environment: context.environment
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
                        console.error(event.error)
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
          NEXT: [
            {
              target: '#game.title',
              guard: 'highscoresDisabled'
            },
            {
              target: 'highscores.new',
              guard: 'isHighscore'
            },
            {
              target: 'highscores.show'
            }
          ]
        }
      },
      highscores: {
        initial: 'new',
        states: {
          new: {
            on: {
              SUBMIT_HIGHSCORE: {
                target: 'show',
                actions: [
                  assign({
                    lastHighscore: ({ event }) => event.highscore
                  }),
                  'saveHighscore'
                ]
              }
            }
          },
          show: {
            on: {
              NEXT: {
                target: '#game.title'
              }
            }
          }
        },
        exit: 'callGameEnd'
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
      startGameTimeout: ({ context }) => {
        if (context.environment.timeoutEnabled) {
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
      saveHighscore: ({ context, event }) => {
        if (event.type === 'SUBMIT_HIGHSCORE') {
          context.environment.saveHighscore?.(event.highscore)
        }
      },
      callGameStart: ({ context }) => {
        context.environment.onGameStart?.()
      },
      callGameEnd: ({ context }) => {
        context.environment.onGameEnd?.()
      }
    },
    actors: {
      getConfiguration: fromPromise(async (): Promise<Configuration> => getConfiguration()),
      fetchRoundData: fromPromise(
        async ({
          input
        }: {
          input: { rounds: Rounds; configuration: Configuration; environment: ArcadeEnvironment }
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

          while (!success && tries < maxTries) {
            const previousAnnotationUrls = [
              ...input.rounds
                .filter((round): round is LoadedRound => round.loaded)
                .map((round) => round.annotationUrl),
              ...get(failedAnnotationUrls)
            ].filter((url) => url)

            annotationUrl = await input.environment.getRandomAnnotationUrl(
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
      ),
      getHighscores: fromPromise(
        async ({ input }: { input: { environment: ArcadeEnvironment } }): Promise<Highscore[]> =>
          input.environment.getHighscores?.() || []
      )
    },
    guards: {
      playing: ({ context }: { context: Context }) => context.rounds.length < NUMBER_OF_ROUNDS,
      highscoresDisabled: ({ context }: { context: Context }) =>
        !getHighscoresEnabled(context.environment),
      isHighscore: ({ context }: { context: Context }) => {
        const highscores = context.highscores
        const totalScore = computeTotalScore(context)
        return isHighscore(highscores, totalScore)
      },
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

export const lastHighscore = useSelector(actor, (state) => state.context.lastHighscore)

export const highscores = useSelector(actor, (state) => state.context.highscores)

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

export const totalScore = useSelector(actor, (state) => computeTotalScore(state.context))

export const highscoresEnabled = useSelector(actor, (state) =>
  getHighscoresEnabled(state.context.environment)
)

export const isNewHighscore = derived([highscores, totalScore], ([$highscores, $totalScore]) =>
  isHighscore($highscores, $totalScore)
)

export const keyboardTarget = useSelector(actor, (state) => {
  if (state.matches('round.display.image')) {
    return state.context.imageKeyboardTarget
  } else {
    // in states 'round.display.map' and 'results'
    return state.context.mapKeyboardTarget
  }
})
