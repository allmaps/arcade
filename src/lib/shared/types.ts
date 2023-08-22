import type { Map } from '@allmaps/annotation'

type BaseRound = {
  loaded: boolean
  submitted: boolean
  score: number
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
  imageInfo: any
  startTime: number
  endTime: number
}

export type SubmittedRound = Omit<LoadedRound, 'submitted'> & {
  submitted: true
  submission: {
    zoom: number
    center: number[]
    extent: number[]
  }
}

export type Round = LoadingRound | LoadedRound | SubmittedRound
export type Rounds = Round[]
