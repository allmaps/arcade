import { get, derived } from 'svelte/store'
import { createMachine, assign, interpret, type EventObject } from 'xstate'
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

import {
  failedAnnotationUrls,
  addFailedAnnotationUrl,
  resetFailedAnnotationUrls
} from '$lib/shared/stores/failed-annotation-urls.js'

import { environment } from '$lib/shared/stores/environment'
import { startGameTimeout, stopGameTimeout } from '$lib/shared/stores/game-timeout.js'

import { NUMBER_OF_ROUNDS } from '$lib/shared/constants.js'

import type { Map } from '@allmaps/annotation'

import type { Polygon as GeoJsonPolygon } from 'geojson'

import type {
  Context,
  GameEvent,
  Round,
  LoadedRound,
  SubmittedRound,
  Configuration
} from '$lib/shared/types.js'

function getTime() {
  const date = new Date()
  return date.getTime()
}

function assignLastRound<T extends EventObject>(
  updateFn: (round: Round, event: T, context: Context) => Round
) {
  return assign({
    rounds: (context: Context, event: T) => {
      const lastRoundIndex = context.rounds.length - 1
      let lastRound = context.rounds[context.rounds.length - 1]
      lastRound = updateFn(lastRound, event, context)
      context.rounds[lastRoundIndex] = lastRound
      return context.rounds
    }
  })
}

export const machine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5RQIYFswGIAqBJAsgKIDyAqtgNoAMAuoqAA4D2sAlgC6tMB29IAHogAsAJgA0IAJ6IAjDIDMANgB0ATioiAHEKHyhMzVQCsMgL6mJqDMoA2TFBFbcomCDzDKnANyYBrD1Yedg5OUAjeTADGKJw81DTxfMxssbxIArKG8soiBgDsmvJ6mpoi8poS0gglqjlGqooyQoqqTZp5eeaW6B5gAE59TH2YAHKEABqUtEksHFxpoIIIMoqKIspCRvIyRop5q0aaqnmViKWaynlKMh3yqodrnRYggcqc7DZYY5OJ6clzPD4SyM4ikshBVGUu3uVDy6iUq0UXRePWUYH4DBsKCcowmUzof1mqSBiBBp2qMg2qmpV1UR3KQn2yNegwArtwIMoGIMoH04LBbPZHM5XO5PNwfP5lCymOzOdymLz+YKQs5whKojF5vFfowifMSQh5FtlCshLCOgVFIVmuT2pDVEJjiICiIQXD5MzUWyOVyeXzYALgsKXP1Bn0uVj2AAzIZoaXe2W+hVKwMqkPqnzRVI66aElIG9JLBSKIRqbTml2GKjyWF22F1BoyamaZutoxe6w++X+5VOdiDTAAZWwAEEAEr4mYFwFFxCl2q6PImRRURR3GsyO2qdaiNaaEF3FbGTsebt+xUBgWYlCSULD0gAIXwuCn+YBCwyCAaeVNNxEVBHPUVpbmC1QtBsTp5GUhhwjIZSnso54pleyiwKyABGaAcOwkC4j8eZ6jOn5LD+f7QYB9zHJojTknkQgXHs+6qEoWwgkIiHIb2aboVhOF4d8lAyASREfoaJZlnSOgaAUVA1nWYHLioy4NCIZQyMYB4iJxSaco4sA3pIw6ENgAD6xAADKmQQo4AOKELqID-MSc4IIoRhliYNzyGpVD6OU8jkkov5qdszSiK0IjwjpcrKPphnGWZlmmfgo4AAqOc5haLPOjSXBpjolDcLTHOSLqQh0clukBZSNJ6zwyrF8VYpInhoCgMDDgAEsQADqKXpZl+qzjlCBqUYOTuWs8hXCIOj1IFYGHIx+xVma+RmA1iZNawBktco7UMN1fXWal9lDcRhrjZNuxlLN80seSWwXMVWh+TucGcXArI2OwsCJeZVmpRlhFOcNJGyFcKiltoHQlLkMPkqs2TGO5VAKCU9QGF96G-f9gkXWJrneZCNHQXNHRGFTax0aWyhyapzZqQxzTmM83BMBAcB8IE05E6NAC0LrkgLSJbdYwahHzLmjTsexqDNh4mNoiNgSUv5QzcRhrtB9SIWGQzS9lX47NBCvLmUyvhRUatRTk1y3PcNFaIh7yfEbI1fgBIgqPB2tRf+rZ+XRRga-UjS7LociOvrGJYk4HsQ8sVMbNo5RUOohT7OSTQZxsGjaABChF-V3RdrpidXaBVQGNkPs0lobqAVoHbi2eukXqm8DvjLX4tEjeWvcuhRUzaMXJtxQZClLPfG8WNx2iaO5rNSJhRx0489pefbcAOTCV65uyUvcYU7Nr1KMtu6zLy3ZStKurdl+3sUocqhkz6JvdLPslI+7sdzI3qGSNWEE9xaFKOjYwJ425IQ7q-HimFsLsFwhAA+ssVi-mLjaOE1IM4hxCuHUKGlDgmE3nFXahk0FfnouSTYkImI+xaOuDQzZS4onLjtPat42odTAFQ4sakno6EbHVXQhhapkOatww6-DEBHlNCzGarR6L+SEcpcOCgxEaCUDjH6f1ZHLFXOsKKLQ1wmDhDTRSdNz5rCZnNFWbNTBAA */
    id: 'game',
    schema: {
      context: {} as Context,
      events: {} as GameEvent
    },
    context: {
      rounds: [],
      configuration: defaultConfig,
      error: undefined
    },
    initial: 'loading',
    on: {
      TIMEOUT: {
        target: 'title'
      }
    },
    states: {
      loading: {
        invoke: {
          src: 'getConfiguration',
          onDone: {
            target: 'title',
            actions: assign({
              configuration: (_, event) => event.data
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
                    target: '#game.error',
                    actions: assign({
                      error: (_, event) => event.data
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
      results: {
        initial: 'score',
        states: {
          score: {},
          review: {}
        },
        on: {
          SET_OL_MAP: {
            actions: ['setOlMap']
          },
          NEXT: {
            target: 'title'
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
      startGameTimeout: () => startGameTimeout(),
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
      setOlImage: assign({
        olImage: (context, event) => (event.type === 'SET_OL_IMAGE' ? event.ol : undefined)
      }),
      setOlMap: assign({
        olMap: (context, event) => (event.type === 'SET_OL_MAP' ? event.ol : undefined)
      })
    },
    services: {
      getConfiguration: async (): Promise<Configuration> => getConfiguration(),
      fetchRoundData: async (context): Promise<Partial<LoadedRound>> => {
        let annotationUrl: string | undefined
        let map: Map | undefined
        let transformer: GcpTransformer | undefined
        let imageInfo: unknown | undefined
        let geoMask: GeoJsonPolygon | undefined
        let area: number | undefined
        let maxScore: number | undefined

        const maxTries = 5
        let tries = 0
        let success = false

        const $environment = get(environment)

        while (!success && tries < maxTries) {
          const previousAnnotationUrls = [
            ...context.rounds
              .filter((round): round is LoadedRound => round.loaded)
              .map((round) => round.annotationUrl),
            ...get(failedAnnotationUrls)
          ].filter((url) => url)

          annotationUrl = await $environment.getRandomAnnotationUrl(
            context.configuration,
            previousAnnotationUrls
          )

          if (annotationUrl) {
            try {
              map = await fetchMap(annotationUrl)
              transformer = new GcpTransformer(map.gcps)
              imageInfo = await fetchImageInfo(map.resource.id)

              geoMask = transformer.transformToGeoAsGeojson([map.resourceMask])
              area = getArea(
                new GeoJSON().readGeometry(geoMask, {
                  dataProjection: 'EPSG:4326',
                  featureProjection: 'EPSG:3857'
                })
              )

              maxScore = computeMaxScore(context.configuration, area)

              success = true
            } catch (err) {
              console.warn('Failed to load annotation', annotationUrl)
              addFailedAnnotationUrl(annotationUrl)
            }
          }

          tries++
        }

        if (success) {
          return {
            loaded: true,
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
    },
    guards: {
      playing: (context) => context.rounds.length < NUMBER_OF_ROUNDS
    },
    delays: {}
  }
)

export const gameService = interpret(machine).start()

export const configuration = useSelector(gameService, (state) => state.context.configuration)

export const rounds = useSelector(gameService, (state) => state.context.rounds)

export const error = useSelector(gameService, (state) => state.context.error)

export const currentRound = useSelector(gameService, (state) => {
  if (state.context.rounds.length > 0) {
    return state.context.rounds[state.context.rounds.length - 1]
  }
})

export const currentRoundIndex = derived(currentRound, ($currentRound) => $currentRound?.index)

export const currentRoundNumber = derived(currentRound, ($currentRound) => $currentRound?.number)

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
  } else {
    // in states 'round.display.map' and 'results'
    target = state.context.olMap?.getTarget()
  }

  // HTMLElement does not exist when not in browser
  // check if not string instead
  if (typeof target !== 'string') {
    return target
  }
})
