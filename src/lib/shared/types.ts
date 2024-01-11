import type { Map } from '@allmaps/annotation'
import type { GcpTransformer } from '@allmaps/transform'

import type { Polygon as GeoJsonPolygon } from 'geojson'

type BaseRound = {
  index: number
  number: number
  loaded: boolean
  submitted: boolean
  score: number
  colors: {
    bgClass: string
    bgClassFaded: string
    color: string
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

export type Button = {
  keyCode: string
  keyLabel?: string
  bgClass?: string
}

export type Buttons = [Button, Button, Button, Button]

export interface ArcadeEnvironment {
  getButtons(): Buttons
  getButton(index: number): Button

  getAnnotationUrls(): Promise<string[]>
  getRandomAnnotationUrl(previousAnnotationUrls: string[]): Promise<string>

  // getHighscores(): Promise<Highscore>[]
  // saveHighscore(): void
}
