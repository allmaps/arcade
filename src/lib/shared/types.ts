import type { z } from 'zod'

import type { MachineContext } from 'xstate'

import type { Map } from '@allmaps/annotation'
import type { GcpTransformer } from '@allmaps/transform'
import type { GeojsonPolygon, Point } from '@allmaps/types'

import type { ConfigurationSchema, HighscoreSchema } from '$lib/shared/schemas.js'

import type { FailedAnnotationUrlsState } from '$lib/shared/stores/failed-annotation-urls.svelte.js'
import type { GameTimeoutState } from '$lib/shared/stores/game-timeout.svelte.js'

export type Configuration = z.infer<typeof ConfigurationSchema>

export type Highscore = z.infer<typeof HighscoreSchema>

export type MappingLibrary = 'maplibre' | 'openlayers'

export type KeyboardTarget = {
  element: HTMLElement
  library: MappingLibrary
}

export type LayoutData = {
  environment: ArcadeEnvironment
  configuration: Configuration
}

export type GameInput = {
  environment: ArcadeEnvironment
  configuration: Configuration
  failedAnnotationUrlsState: FailedAnnotationUrlsState
  gameTimeoutState: GameTimeoutState
}

export interface Context extends MachineContext {
  rounds: Rounds
  environment: ArcadeEnvironment
  configuration: Configuration
  failedAnnotationUrlsState: FailedAnnotationUrlsState
  gameTimeoutState: GameTimeoutState
  imageKeyboardTarget?: KeyboardTarget
  mapKeyboardTarget?: KeyboardTarget
  error?: Error
  lastHighscore?: Highscore
  highscores: Highscore[]
}

export type GameEvent =
  | { type: 'NEXT' }
  | { type: 'START' }
  | { type: 'FINISHED' }
  | { type: 'MAP_MOVED' }
  | { type: 'SET_IMAGE_KEYBOARD_TARGET'; element: HTMLElement; library: MappingLibrary }
  | { type: 'SET_MAP_KEYBOARD_TARGET'; element: HTMLElement; library: MappingLibrary }
  | { type: 'SHOW_IMAGE' }
  | { type: 'SHOW_MAP' }
  | { type: 'SUBMIT'; endTime: number; submission: Submission }
  | { type: 'SUBMIT_HIGHSCORE'; highscore: Highscore }
  | { type: 'TIMEOUT' }

type BaseRound = {
  index: number
  number: number
  loaded: boolean
  submitted: boolean
  score: number
  colors: {
    bgClass: string
    bgClassFaded: string
    textColor: string
    color: string
    convexHullColor: string
  }
}

export type LoadingRound = BaseRound & {
  loaded: false
  submitted: false
}

export type LoadedRound = BaseRound & {
  loaded: true
  submitted: false
  canSubmit: boolean
  annotationUrl: string
  map: Map
  transformer: GcpTransformer
  geoMask: GeojsonPolygon
  area: number
  maxScore: number
  imageInfo: any
  startTime: number
}

export type SubmittedRound = Omit<LoadedRound, 'submitted'> & {
  submitted: true
  endTime: number
  scoreRatios: Ratios
  submission: Submission
}

export type Round = LoadingRound | LoadedRound | SubmittedRound
export type Rounds = Round[]

export type Submission = {
  zoom: {
    submission: number
    warpedMap: number
  }
  center: {
    submission: Point
    warpedMap: Point
  }
  distance: number
  geoMask: GeojsonPolygon
  area: number
  convexHull: GeojsonPolygon
  found: boolean
}

export type Ratios = {
  time: number
  zoom: number
  distance: number
}

export type Padding = [number, number, number, number]

export type CallbackFn = (err?: unknown) => void

export type ButtonType = 'toggle' | 'zoomOut' | 'zoomIn' | 'submit'

export type Button = {
  keyCode: string
  keyLabel?: string
  bgClass?: string
  textClass?: string
  type?: 'primary' | 'secondary'
  icon?: boolean
}

export type Buttons = { [T in ButtonType]: Button }

export interface ArcadeEnvironment {
  buttons: Buttons
  timeoutEnabled: boolean

  getButton(type: ButtonType): Button

  onGameStart?(): void
  onGameEnd?(): void

  getAnnotationUrls(configuration: Configuration): Promise<string[]>
  getRandomAnnotationUrl(
    configuration: Configuration,
    previousAnnotationUrls: string[]
  ): Promise<string>

  getHighscores?(): Promise<Highscore[]>
  saveHighscore?(highscore: Highscore): Promise<void>
}
