import { createMachine, assign, fromPromise, raise } from 'xstate'

import { getArea } from 'ol/sphere.js'
import GeoJSON from 'ol/format/GeoJSON.js'

import { fetchImageInfo } from '@allmaps/stdlib'
import { GcpTransformer } from '@allmaps/transform'

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
import { getTimeoutSignal } from '$lib/shared/timeout.js'
import { assignLastRound } from '$lib/shared/xstate.js'
import { NUMBER_OF_ROUNDS } from '$lib/shared/constants.js'

import type { Map } from '@allmaps/annotation'
import type { GeojsonPolygon } from '@allmaps/types'

import type {
  Context,
  GameEvent,
  Rounds,
  LoadedRound,
  GameInput,
  ArcadeEnvironment,
  Highscore
} from '$lib/shared/types.js'

function getTime() {
  const date = new Date()
  return date.getTime()
}

export type GameMachine = typeof gameMachine

export const gameMachine = createMachine(
  {
    id: 'game',
    types: {
      context: {} as Context,
      events: {} as GameEvent
    },
    context: ({ input }: { input: GameInput }) => ({
      ...input,
      rounds: [] as Rounds,
      highscores: []
    }),
    initial: 'title',
    on: {
      TIMEOUT: {
        target: '.title'
      }
    },
    states: {
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
                    context
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
      resetRounds: assign({
        rounds: ({ context }) => {
          context.failedAnnotationUrlsState?.resetFailedAnnotationUrls()
          return []
        }
      }),
      startGameTimeout: ({ context }) => {
        if (context.environment.timeoutEnabled) {
          context.gameTimeoutState.startGameTimeout()
        }
      },
      stopGameTimeout: ({ context }) => context.gameTimeoutState.stopGameTimeout(),
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
      fetchRoundData: fromPromise(
        async ({ input }: { input: { context: Context } }): Promise<Partial<LoadedRound>> => {
          const { configuration, environment, failedAnnotationUrlsState } = input.context

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
              ...input.context.rounds
                .filter((round): round is LoadedRound => round.loaded)
                .map((round) => round.annotationUrl),
              ...failedAnnotationUrlsState?.failedAnnotationUrls
            ].filter((url) => url)

            annotationUrl = await environment.getRandomAnnotationUrl(
              configuration,
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

                maxScore = computeMaxScore(configuration, area)

                success = true
              } catch (err) {
                console.warn('Failed to load annotation', annotationUrl, err)
                failedAnnotationUrlsState.addFailedAnnotationUrl(annotationUrl)
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
