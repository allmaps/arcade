import type { z } from 'zod'
import type OLMap from 'ol/Map.js'

import type { Map } from '@allmaps/annotation'
import type { GcpTransformer } from '@allmaps/transform'

import type { Polygon as GeoJsonPolygon } from 'geojson'

import type { ConfigurationSchema } from '$lib/shared/schemas.js'

export type Configuration = z.infer<typeof ConfigurationSchema>

export type Context = {
  rounds: Rounds
  configuration: Configuration
  olImage?: OLMap
  olMap?: OLMap
  error?: Error
}

export type GameEvent =
  | { type: 'NEXT' }
  | { type: 'START' }
  | { type: 'SET_OL_IMAGE'; ol: OLMap }
  | { type: 'SET_OL_MAP'; ol: OLMap }
  | { type: 'SHOW_IMAGE' }
  | { type: 'SHOW_MAP' }
  | { type: 'SUBMIT'; endTime: number; submission: Submission }
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
  annotationUrl: string
  map: Map
  transformer: GcpTransformer
  geoMask: GeoJsonPolygon
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
    submission: number[]
    warpedMap: number[]
  }
  distance: number
  geoMask: GeoJsonPolygon
  area: number
  convexHull: GeoJsonPolygon
  found: boolean
}

export type Ratios = {
  time: number
  zoom: number
  distance: number
}

// TODO: import from stdlib
export type BBox = number[]

export type Size = [number, number]

export type Padding = [number, number, number, number]

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

  getButton(type: ButtonType): Button

  getAnnotationUrls(configuration: Configuration): Promise<string[]>
  getRandomAnnotationUrl(
    configuration: Configuration,
    previousAnnotationUrls: string[]
  ): Promise<string>

  // getHighscores(): Promise<Highscore>[]
  // saveHighscore(): void
}
