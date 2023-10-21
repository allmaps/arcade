import { getDistance } from 'ol/sphere.js'

import { DEFAULT_RADIUS } from 'ol/sphere.js'

import type { Submission } from '$lib/shared/types.js'

const MAX_POINTS = 5000

const CIRCUMFERENCE = 2 * Math.PI * DEFAULT_RADIUS
const MAX_DISTANCE = CIRCUMFERENCE / 2

export function computeDistanceRatio(svgCenter: number[], warpedMapCenter: number[]) {
  const distance = getDistance(svgCenter, warpedMapCenter)
  const distanceRatio = Math.max(1 - distance / MAX_DISTANCE, 0)
  return distanceRatio
}

export function computeAreaRatio(svgArea: number, warpedMapArea: number) {
  let areaRatio = svgArea / warpedMapArea

  if (areaRatio > 1) {
    areaRatio = 1 / areaRatio
  }

  return areaRatio
}

export function computeScore(startTime: number, endTime: number, submission: Submission) {
  const timeSeconds = (endTime - startTime) / 1000

  // const distanceRatio = computeDistanceRatio(submission.center?.svg, submission.center?.warpedMap)
  // const zoomDiff = computeAreaRatio(submission.areas.svg, submission.areas.warpedMap)

  // const score = Math.round(distanceRatio * areaRatio * MAX_POINTS)
  return 0
}

//     console.log('nu computeScore')

//     if (event.type === 'SUBMIT') {
//       console.log('event.data', event.data)
//     }

//     let round = context.rounds[context.rounds.length - 1]

//     if (!round.loaded) {
//       throw new Error('round not loaded')
//     }

//     if (!context.olMap) {
//       throw new Error('olMap not set')
//     }

//     const view = context.olMap.getView()

//     if (!view) {
//       throw new Error('olMap view not set')
//     }

//     const zoom = view.getZoom()
//     const center = view.getCenter()
//     const extent = view.calculateExtent(context.olMap.getSize())

//     if (!zoom) {
//       throw new Error('olMap zoom not set')
//     }

//     if (!center) {
//       throw new Error('olMap center not set')
//     }

//     round = {
//       ...round,
//       score: Math.round(Math.random() * 100),
//       submission: {
//         zoom,
//         center,
//         extent
//       },
//       submitted: true
