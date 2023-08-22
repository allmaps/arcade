import { createMachine, assign, interpret, type DoneInvokeEvent } from 'xstate'
import { useSelector } from '@xstate/svelte'

import { fetchImageInfo } from '@allmaps/stdlib'

import { getRandomAnnotationUrl, fetchMap } from '$lib/shared/map.js'

import type OLMap from 'ol/Map.js'

import type { Round, LoadedRound, Rounds } from '$lib/shared/types.js'

const NUMBER_OF_ROUNDS = 5
const DELAY_MS = 6000

type Context = {
  olImage?: OLMap
  olMap?: OLMap
  rounds: Rounds
}

type GameEvent =
  | { type: 'NEXT' }
  | { type: 'SET_OL_IMAGE'; ol: OLMap }
  | { type: 'SET_OL_MAP'; ol: OLMap }
  | { type: 'SHOW_IMAGE' }
  | { type: 'SHOW_MAP' }
  | { type: 'SUBMIT' }
  | { type: 'TICK' }

function getTime() {
  const date = new Date()
  return date.getTime()
}

function assignLastRound(updateFn: (round: Round) => Round) {
  return assign({
    rounds: (context: Context) => {
      const lastRoundIndex = context.rounds.length - 1
      let lastRound = context.rounds[context.rounds.length - 1]
      lastRound = updateFn(lastRound)
      context.rounds[lastRoundIndex] = lastRound
      return context.rounds
    }
  })
}

export const machine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5RQIYFswDpYBcUCccBiAOQFEANAFQG0AGAXUVAAcB7WASx07YDtmIAB6IAjAGYArJgBskmQCYALEoAcS0ZskKANCACeiBQunG5kgOwXVC0TJl1VAXyd7UGTO7ABJPjnxspJS0jILsXDz8giII4jIWmKIAnNpJqqp24nS2FnqGCKI2skriyQrZdKLZoi5u6Fhevv6BQrgoOFgoAGYd+AAU5XR0AJREXp71TQH0TEgg4dy8AnMxcQnJqemZ1bkGRuLiiSUKWZWSVar2tSDjAQCufBBEVN4AwgDSM2Eci1EriBYlApZKILIUknQlENJCk8mI1NILAokqIlA4VKiaq4bvVMPdHpgADZsFAQTh8KBECD8LDkgBubAA1g1cfiIESSWSKQh6WwAMbtJYzL5zBaRZagVYlRIyKFWEpKCylGRwgqaJSYVR0JGKUHpVTna63NgPdksQkofRUmnYPAdCYeNmYc2WkWsH7i6KIcTSuxywE+pV2VUGuiYRwGhQWSQHJRJCxG1kmgkuq3UvhYNr242m50W-Q0USzd0RJZegpopKaqRJIHVKOiXR7BBJFKJS6gpLiGwxugyROO5Nm-PYAAWbAA7lM2Hih9OgtQ3fMPWX-ghARrzvI45JJHGdarrKpMLu0kldX74gOsE7U2PJ9PZ6b5607Z0emB+oMRmMk7m77A45Tn4ARPo805LmKq6SgCKgnqI24pHu8YKCqzaAqI4YwqoSppKhJjiNeYHDpamBkrAqZEAAymQVAAPoAPIADJ0d4ACyACCADiZCQSufwwS2jiJKC5SofqaiqKqeEnue4jidYdAHEkRG3iO5GUTR9HMXRnEAAp8aWAnCIgKLSMqGgWGk9jak2+TpDIRzydk8TIhYVzYjmKbqZwFEjpwaAoDA1EABIMQA6rpHEGaEor8RKJnrj6mC2Dh8SSNqmi1qqjbRpgBySAaVlyGCKSqUOeakRp-mBcFVEAKoAEJsd4ITFsuRkJTEaSHOeaXxI4QyFDlbkpe51SqOIELqOV-4+X5pGBSwoURaxnE8YZvxdQCySauUBwyCidjZJIOXydIk2FSk562f2nl-t5VW+XeS3UU1LVtd8nXlqVe1KXER0OCYOUIYcyFKDCSrmDGRGwHcaCBfgVrkIusUllt5baDlqhJMChTGBY2RxskM33R4o6cFAo6wHybD4HAC6fXF31ro2I0uNifBsBAcCCF4X0Y2uAC0cSqkLeVxq2KTxHJSrOGTmZ4IQAuemuQKqjkxTnQ2zmoYRCsOj4IFsCr0GJScVaon2kIlIoEKnc2xiIqhhXiEiaTJKis2PKbxkxDCqoQ1Wsra8oGinJI3vssSpLklAvvbQU2ohlk+XducPr4Rl8t1IOc2WgnmOFPlMJQgo6gZEioiqnu6zHD6tatlCOc4nnj36PewHNIXa7yI5NZlxXonV82MjJSHOTmNGdhR5VHeAQ+xvEdOPeCTIqIl7W2RD1Xh5opgirmGPKFxLPAFAY+qZx6viWXAk1gQhCsomFYI-5EiePHHrdC4whd25zeCqd5qoF2ZoLQSlhMID23moYeOU+yOUhLWc4jgsgon1gA4ic8yLPRqkFMAN8YjpEREpVEhVkSdjsmIZymBowmGmiidyqEz7zReigFghDEDryrNA8usDd7NgkAhA+Dh1DRihHGNELCnoLXnncAARmgbgHQICcLVGoWhONMqNmRCocQI0tQnhOuImQBp14KFhvDRG+R0aq0EnYNIacYTdnjONKhLZaztm4RuUqjgiIUypjTOmvMwF2MSghaQagSgwhiaCbQDt8iFBwuGNIONsKyi7BzJwQA */
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
        },
        after: {
          [DELAY_MS]: {
            target: 'round'
          }
        }
      },
      round: {
        id: 'round',
        initial: 'loading',
        states: {
          loading: {
            entry: ['createRound'],
            invoke: {
              src: 'fetchRoundData',
              onDone: {
                target: 'play',
                actions: assign({
                  rounds: (context, event: DoneInvokeEvent<LoadedRound>) => {
                    context.rounds[context.rounds.length - 1] = event.data
                    return context.rounds
                  }
                })
              }
            }
          },
          play: {
            type: 'parallel',
            states: {
              showIntro: {
                initial: 'roundIntro',
                states: {
                  roundIntro: {
                    on: {
                      NEXT: {
                        target: 'playing'
                      }
                    },
                    after: {
                      [DELAY_MS]: {
                        target: 'playing'
                      }
                    }
                  },
                  playing: {
                    type: 'final',
                    entry: 'setStartTime',
                    invoke: {
                      src: (context, event, meta) => (callback) => {
                        const interval = setInterval(() => callback('TICK'), 1000)

                        return () => {
                          clearInterval(interval)
                        }
                      }
                    }
                  }
                }
              },
              display: {
                initial: 'map',
                states: {
                  image: {
                    on: {
                      SHOW_MAP: {
                        target: 'map'
                      },
                      SUBMIT: {
                        actions: ['computeScore'],
                        target: 'submitted'
                      }
                    }
                  },
                  map: {
                    on: {
                      SHOW_IMAGE: {
                        target: 'image'
                      },
                      SUBMIT: {
                        actions: ['computeScore'],
                        target: 'submitted'
                      }
                    }
                  },
                  submitted: {
                    entry: ['computeScore'],
                    type: 'final'
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
            },
            onDone: [
              {
                cond: 'playing',
                target: 'loading'
              },
              {
                target: '#game.summary'
              }
            ]
          }
        },
        on: {
          TICK: {
            actions: assignLastRound((round) => {
              if (round.loaded) {
                round.endTime = getTime()
              }
              return round
            })
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
            score: 0
          })
      }),
      resetRounds: assign({
        rounds: []
      }),
      setStartTime: assignLastRound((round) => {
        if (round.loaded) {
          round.startTime = getTime()
          round.endTime = getTime()
        }
        return round
      }),

      computeScore: assign({
        rounds: (context) => {
          let round = context.rounds[context.rounds.length - 1]

          if (!round.loaded) {
            throw new Error('round not loaded')
          }

          if (!context.olMap) {
            throw new Error('olMap not set')
          }

          const view = context.olMap.getView()

          if (!view) {
            throw new Error('olMap view not set')
          }

          const zoom = view.getZoom()
          const center = view.getCenter()
          const extent = view.calculateExtent(context.olMap.getSize())

          if (!zoom) {
            throw new Error('olMap zoom not set')
          }

          if (!center) {
            throw new Error('olMap center not set')
          }

          round = {
            ...round,
            score: Math.round(Math.random() * 100),
            submission: {
              zoom,
              center,
              extent
            },
            submitted: true
          }

          context.rounds[context.rounds.length - 1] = round

          return context.rounds
        }
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
        const previousAnnotationUrls = context.rounds
          .filter((round): round is LoadedRound => round.loaded)
          .map((round) => round.annotationUrl)

        const annotationUrl = getRandomAnnotationUrl(previousAnnotationUrls)
        const map = await fetchMap(annotationUrl)
        const imageInfo = await fetchImageInfo(map.resource.id)

        return {
          loaded: true,
          startTime: 0,
          endTime: 0,
          annotationUrl,
          map,
          imageInfo
        }
      }
    },
    guards: { playing: (context) => context.rounds.length < NUMBER_OF_ROUNDS },
    delays: {}
  }
)

export const gameService = interpret(machine).start()

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

export const score = useSelector(gameService, (state) =>
  state.context.rounds
    .filter((round): round is LoadedRound => round.submitted)
    .reduce((acc, round) => acc + round.score, 0)
)

export const olTarget = useSelector(gameService, (state) => {
  let target: HTMLElement | string | undefined

  if (state.matches('round.play.display.image')) {
    target = state.context.olImage?.getTarget()
  } else if (state.matches('round.play.display.map')) {
    target = state.context.olMap?.getTarget()
  }

  // HTMLElement does not exist when not in browser
  // check if not string instead
  if (typeof target !== 'string') {
    return target
  }
})
