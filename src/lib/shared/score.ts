import { getDistance } from 'ol/sphere.js'

import { DEFAULT_RADIUS } from 'ol/sphere.js'

import type { Submission } from '$lib/shared/types.js'

const MAX_POINTS = 5000

const CIRCUMFERENCE = 2 * Math.PI * DEFAULT_RADIUS
const MAX_DISTANCE = CIRCUMFERENCE / 2

const areaWeight = 50
const distanceWeight = 0.9
const zoomWeight = 0.3
const timeWeight = 1

const areaFunction = squaredFunction
const distanceFunction = cubicFunction
const zoomFunction = squaredFunction
const timeFunction = easeInOutSineFunction

function squaredFunction(ratio: number) {
  return Math.pow(1 - ratio, 2)
}

function cubicFunction(ratio: number) {
  return Math.pow(1 - ratio, 3)
}

function easeInOutSineFunction(ratio: number) {
  return -(Math.cos(Math.PI * (1 - ratio)) - 1) / 2
}

function quinticFunction(ratio: number) {
  return Math.pow(1 - ratio, 5)
}

export function scoreFunction(
  areaRatio: number,
  distanceRatio: number,
  zoomRatio: number,
  timeRatio: number
) {
  return (
    ((areaWeight *
      areaFunction(areaRatio) *
      (distanceWeight * distanceFunction(distanceRatio) + zoomWeight * zoomFunction(zoomRatio))) /
      (distanceWeight + zoomWeight)) *
    timeWeight *
    timeFunction(timeRatio)
  )
}

// export function computeDistanceRatio(svgCenter: number[], warpedMapCenter: number[]) {
//   const distance = getDistance(svgCenter, warpedMapCenter)
//   const distanceRatio = Math.max(1 - distance / MAX_DISTANCE, 0)
//   return distanceRatio
// }

// export function computeAreaRatio(svgArea: number, warpedMapArea: number) {
//   let areaRatio = svgArea / warpedMapArea

//   if (areaRatio > 1) {
//     areaRatio = 1 / areaRatio
//   }

//   return areaRatio
// }

//   // const distanceRatio = computeDistanceRatio(submission.center?.svg, submission.center?.warpedMap)
//   // const zoomDiff = computeAreaRatio(submission.areas.svg, submission.areas.warpedMap)

//   // const score = Math.round(distanceRatio * areaRatio * MAX_POINTS)

export function computeScore(startTime: number, endTime: number, submission: Submission) {
  const timeMax = 60 * 1000

  const areaMin = 5000
  const areaMax = 20000

  const areaRatio = Math.max((submission.area - areaMin) / (areaMax - areaMin), 0)
  const distanceRatio = submission.distance / MAX_DISTANCE
  const zoomRatio = submission.zoom.submission / submission.zoom.warpedMap
  const timeRatio = (endTime - startTime) / timeMax

  const score = scoreFunction(areaRatio, distanceRatio, zoomRatio, timeRatio)
  return Math.round(score / 1000) * 10
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
