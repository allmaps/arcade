import type { Map } from '@allmaps/annotation'
import type { GCPTransformer } from '@allmaps/transform'

type BaseRound = {
  loaded: boolean
  submitted: boolean
  score: number
  colors: {
    bgClass: string
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
  transformer: GCPTransformer
  imageInfo: any
  startTime: number
}

export type SubmittedRound = Omit<LoadedRound, 'submitted'> & {
  submitted: true
  endTime: number
  submission: Submission
}

export type Round = LoadingRound | LoadedRound | SubmittedRound
export type Rounds = Round[]

export type Submission = {
  area: number
  zoom: {
    submission: number
    warpedMap: number
  }
  center: {
    submission: number[]
    warpedMap: number[]
  }
  distance: number
}

// TODO: import from stdlib
export type BBox = number[]

export type Size = [number, number]

export type Padding = [number, number, number, number]
