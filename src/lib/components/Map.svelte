<script lang="ts">
  import { onMount } from 'svelte'
  import { fade } from 'svelte/transition'

  import { Map, addProtocol, type MapLayerEventType } from 'maplibre-gl'
  import { layers, namedFlavor } from '@protomaps/basemaps'
  import { Protocol } from 'pmtiles'

  import { throttle } from 'lodash-es'

  import GeoJSON from 'ol/format/GeoJSON.js'

  import { getDistance, getArea } from 'ol/sphere.js'

  import { computeBbox, bboxToCenter } from '@allmaps/stdlib'
  import { WarpedMapLayer } from '@allmaps/maplibre'

  import { geometryToPixels, coordinatesToSvgPoints, getConvexHull } from '$lib/shared/geometry.js'
  import { generateEmptyFeatureCollection } from '$lib/shared/geojson.js'

  import { getSnapshotState } from '$lib/shared/stores/snapshot.svelte.js'
  import { getTimerState } from '$lib/shared/stores/timer.svelte.js'
  import { getGameTimeoutState } from '$lib/shared/stores/game-timeout.svelte.js'

  import {
    flyTo,
    convexHullStyle,
    maskStyle,
    makeHandleKeydownWithPanStepAndZoomFraction,
    getFirstSymbolLayerId,
    disableInteraction,
    enableInteraction
  } from '$lib/shared/maplibre.js'

  import { computeZoomRatio, computeDistanceRatio } from '$lib/shared/score.js'

  import PerfectScore from '$lib/components/PerfectScore.svelte'

  import { PADDING } from '$lib/shared/constants.js'

  import type { SnapshotFrom } from 'xstate'

  import type { GeoJSONSource } from 'maplibre-gl'
  import type { GeojsonPolygon, Point } from '@allmaps/types'

  import type { GameMachine } from '$lib/shared/machines/game.js'

  import type { LoadedRound, Submission, CallbackFn } from '$lib/shared/types.js'

  const { snapshot, send, actorRef, currentRound, currentRoundIndex } = getSnapshotState()
  const gameTimeoutState = getGameTimeoutState()
  const timerState = getTimerState()

  let map: Map

  let warpedMapLayer: WarpedMapLayer

  let mounted = $state(false)

  // TODO: get from config
  const panStep = 150
  const ENABLE_INTERACTION_TIMEOUT = 500

  let container: HTMLElement

  let svgPolygon = $state<SVGPathElement>()

  let strokeColor = $state('#ffffff00')

  let contentBoxSize = $state<ResizeObserverSize>()

  let warpedMapZoom: number

  let mapHadFirstInteraction = false

  let submitted = false
  let perfectScore = false
  let submission: Submission | undefined

  let showPerfectScore = $state(false)

  const geoMask = ($currentRound as LoadedRound).geoMask

  let convexHull: GeojsonPolygon | undefined
  let submittedGeoMask: GeojsonPolygon | undefined

  let svgCoordinates = $derived.by(() => {
    if (contentBoxSize) {
      return geometryToPixels(
        geoMask,
        [contentBoxSize.inlineSize, contentBoxSize.blockSize],
        PADDING
      )
    }

    return []
  })

  function getWarpedMapCenter(): Point {
    return bboxToCenter(computeBbox(geoMask))
  }

  function getSubmissionCenter() {
    return map.getCenter().toArray()
  }

  function getWarpedMapPixelCenter(): Point {
    const point = map.project(bboxToCenter(computeBbox(geoMask)))
    return [point.x, point.y]
  }

  function getSubmissionPixelCenter() {
    if (svgPolygon) {
      const svgPixelBBox = svgPolygon.getBBox()
      const svgPixelCenter = [
        svgPixelBBox.x + svgPixelBBox.width / 2,
        svgPixelBBox.y + svgPixelBBox.height / 2
      ]

      return svgPixelCenter
    }
  }

  function getWarpedMapZoom() {
    const bbox = computeBbox(geoMask)

    const centerZoomBearing = map.cameraForBounds(bbox, {
      padding: { top: PADDING[0], bottom: PADDING[2], left: PADDING[3], right: PADDING[1] }
    })

    if (centerZoomBearing && centerZoomBearing.zoom !== undefined) {
      return centerZoomBearing.zoom
    }

    return 0
  }

  function getSubmissionZoom() {
    return map.getZoom()
  }

  export function flyToSubmission(callback?: CallbackFn) {
    if (submission) {
      const center = submission.center.submission
      const zoom = submission.zoom.submission

      flyTo(map, center, zoom, () => {
        // map.setPaintProperty('convex-hull', 'fill-opacity', 0)
        callback?.()
      })
      map.setPaintProperty('convex-hull', 'fill-opacity', 1)
    }
  }

  export function flyToWarpedMap(callback?: CallbackFn) {
    if (geoMask) {
      const center = getWarpedMapCenter()
      const zoom = getWarpedMapZoom()

      flyTo(map, center, zoom, () => {
        map.setPaintProperty('convex-hull', 'fill-opacity', 0)
        callback?.()
      })
      map.setPaintProperty('convex-hull', 'fill-opacity', 1)
    }
  }

  function getSubmittedGeoMask(): GeojsonPolygon {
    const submittedGeoMask = {
      type: 'Polygon' as const,
      coordinates: [
        [...svgCoordinates, svgCoordinates[0]].map((coordinate) =>
          map.unproject(coordinate).toArray()
        )
      ]
    }

    return submittedGeoMask
  }

  export function getSubmission(found?: boolean): Submission {
    const warpedMapZoom = getWarpedMapZoom()
    const warpedMapCenter = getWarpedMapCenter()

    let submissionZoom: number
    let submissionCenter: Point

    if (found) {
      submissionZoom = warpedMapZoom
      submissionCenter = warpedMapCenter
      submittedGeoMask = geoMask
    } else {
      submissionZoom = getSubmissionZoom()
      submissionCenter = getSubmissionCenter()
      submittedGeoMask = getSubmittedGeoMask()
    }

    const area = getArea(
      new GeoJSON().readGeometry(submittedGeoMask, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      })
    )

    convexHull = getConvexHull(geoMask, submittedGeoMask)

    if (!convexHull) {
      throw new Error('No convexHull')
    }

    submission = {
      zoom: {
        warpedMap: warpedMapZoom,
        submission: submissionZoom
      },
      center: {
        warpedMap: warpedMapCenter,
        submission: submissionCenter
      },
      distance: getDistance(warpedMapCenter, submissionCenter),
      geoMask: submittedGeoMask,
      area,
      convexHull,
      found: found || false
    }

    return submission
  }

  function handleTransition(snapshot: SnapshotFrom<GameMachine>) {
    if (!submitted && snapshot.matches('round.progress.submitted')) {
      warpedMapLayer.setOpacity(1)
      submitted = true

      map.setPaintProperty('convex-hull', 'fill-opacity', 1)

      map.off('move', throttledHandleMapmove)

      // Add submittedGeoMask to map
      // submittedGeoMask should already been set. Throw error otherwise
      if (!submittedGeoMask || !convexHull) {
        throw new Error('No submittedGeoMask or no convexHull')
      }

      const submissionSource = map.getSource('submission') as GeoJSONSource
      submissionSource.setData(submittedGeoMask)

      if (!perfectScore) {
        const convexHullSource = map.getSource('convex-hull') as GeoJSONSource
        convexHullSource.setData(convexHull)

        disableInteraction(map, () => {
          flyToWarpedMap(() => {
            if (mounted) {
              send({ type: 'FINISHED' })
              map.setPaintProperty('convex-hull', 'fill-opacity', 0)

              setTimeoutEnableInteraction()
            }
          })
        })
      }
    }

    if (snapshot.matches('round.progress.submitted.review')) {
      showPerfectScore = false
    }
  }

  function handleSubmit(found?: boolean) {
    send({
      type: 'SUBMIT',
      endTime: timerState.endTime,
      submission: getSubmission(found)
    })
  }

  function handleMapmove() {
    if (submitted) {
      return
    }

    const submissionCenter = getSubmissionCenter()

    if (!submissionCenter || !$currentRound?.loaded) {
      return
    }

    const zoomRatio = computeZoomRatio({
      zoom: {
        warpedMap: getWarpedMapZoom(),
        submission: getSubmissionZoom()
      }
    })

    const distanceRatio = computeDistanceRatio($currentRound.area, {
      distance: getDistance(getWarpedMapCenter(), submissionCenter)
    })

    // TODO: Turn 0.7 into configuration variable
    const distanceRatioVisible = 0.7
    const zoomRatioVisible = 0.6

    if (zoomRatio > zoomRatioVisible && distanceRatio > distanceRatioVisible) {
      const zoomOpacityRatio = (zoomRatio - zoomRatioVisible) / (1 - zoomRatioVisible)
      const distanceOpacityRatio =
        (distanceRatio - distanceRatioVisible) / (1 - distanceRatioVisible)
      warpedMapLayer.setOpacity(zoomOpacityRatio * distanceOpacityRatio)
    } else {
      warpedMapLayer.setOpacity(0)
    }
  }

  const throttledHandleMapmove = throttle(handleMapmove, 100)

  function handleMovestart(event: MapLayerEventType) {
    mapHadFirstInteraction = true
    send({ type: 'MAP_MOVED' })
  }

  function setTimeoutEnableInteraction() {
    setTimeout(() => {
      if (mounted) {
        enableInteraction(map)
      }
    }, ENABLE_INTERACTION_TIMEOUT)
  }

  function handleMoveend() {
    if (!submitted && !perfectScore) {
      const submissionZoom = getSubmissionZoom()
      const zoomDiff = Math.abs(submissionZoom - warpedMapZoom)

      // Check if center is within panStep + panStepPadding px distance
      const zoomDiffPerfectScore = 0.1
      const panStepPadding = 10
      const distanceThreshold = panStep + panStepPadding

      if (zoomDiff < zoomDiffPerfectScore) {
        const warpedMapPixelCenter = getWarpedMapPixelCenter()
        const submissionPixelCenter = getSubmissionPixelCenter()

        if (warpedMapPixelCenter && submissionPixelCenter) {
          const distanceX = Math.abs(warpedMapPixelCenter[0] - submissionPixelCenter[0])
          const distanceY = Math.abs(warpedMapPixelCenter[1] - submissionPixelCenter[1])

          if (distanceX < distanceThreshold && distanceY < distanceThreshold) {
            // Perfect score!!!
            perfectScore = true

            disableInteraction(map, () => {
              flyToWarpedMap(() => {
                map.stop()

                if (mounted) {
                  showPerfectScore = true

                  handleSubmit(true)
                  send({ type: 'FINISHED' })

                  setTimeoutEnableInteraction()
                }
              })
            })
          }
        }
      }
    }
    gameTimeoutState.resetLastInteraction()
  }

  onMount(() => {
    if (!$currentRound || !$currentRound.loaded || currentRoundIndex === undefined) {
      return
    }

    strokeColor = $currentRound.colors.color

    const protocol = new Protocol()
    addProtocol('pmtiles', protocol.tile)

    const pmLayers = layers('protomaps', namedFlavor('light'), { lang: 'en' })

    // Override background color
    if (pmLayers[0] && pmLayers[0].paint && 'background-color' in pmLayers[0].paint) {
      pmLayers[0].paint['background-color'] = 'rgba(0, 0, 0, 0)'
    }

    map = new Map({
      container,
      style: {
        version: 8,
        glyphs: 'https://protomaps.github.io/basemaps-assets/fonts/{fontstack}/{range}.pbf',
        sources: {
          protomaps: {
            type: 'vector',
            tiles: [import.meta.env.ARCADE_PMTILES_URL],
            maxzoom: 14,
            attribution:
              '<a href="https://protomaps.com">Protomaps</a> © <a href="https://openstreetmap.org">OpenStreetMap</a>'
          }
        },
        layers: pmLayers
      },
      center: $snapshot.context.configuration.map.center as Point,
      zoom: 7,
      maxPitch: 0,
      canvasContextAttributes: {
        preserveDrawingBuffer: true
      },
      attributionControl: false
    })

    map.dragRotate.disable()
    map.touchZoomRotate.disableRotation()

    map.on('load', () => {
      const firstSymbolLayerId = getFirstSymbolLayerId(map)

      if (!$currentRound || !$currentRound.loaded) {
        console.error('Round not loaded')
        return
      }

      map.addSource('submission', {
        type: 'geojson',
        data: generateEmptyFeatureCollection()
      })

      map.addSource('convex-hull', {
        type: 'geojson',
        data: generateEmptyFeatureCollection()
      })

      map.addLayer(
        {
          id: 'convex-hull',
          type: 'fill',
          source: 'convex-hull',
          ...convexHullStyle($currentRound.colors.convexHullColor)
        },
        firstSymbolLayerId
      )

      warpedMapLayer = new WarpedMapLayer()

      // @ts-expect-error: MapLibre typings are incomplete
      map.addLayer(warpedMapLayer, firstSymbolLayerId)

      map.addLayer(
        {
          id: 'submission',
          type: 'line',
          source: 'submission',
          ...maskStyle(strokeColor)
        },
        firstSymbolLayerId
      )

      warpedMapLayer.setOpacity(0)
      warpedMapLayer.addGeoreferencedMap($currentRound.map)

      send({
        type: 'SET_MAP_KEYBOARD_TARGET',
        element: map.getCanvas(),
        library: 'maplibre'
      })
    })

    const subscription = actorRef.subscribe(handleTransition)

    warpedMapZoom = getWarpedMapZoom()

    const zoomFraction = warpedMapZoom % 1

    const initialZoom = $snapshot.context.configuration.map.initialZoom + zoomFraction
    const minZoom = 1 + zoomFraction
    const maxZoom = warpedMapZoom + 4

    // MapLibre's regular keyboard handler rounds the zoom level
    // when zooming with the keyboard. Override the keydown
    // handler to prevent this.
    // @ts-expect-error: MapLibre typings are incomplete
    map.keyboard.keydown = makeHandleKeydownWithPanStepAndZoomFraction(panStep, zoomFraction)

    map.setMinZoom(minZoom)
    map.setMaxZoom(maxZoom)

    map.setZoom(initialZoom)

    // function handleRendercomplete() {
    //   mapHadFirstInteraction = false

    //   ol.un('rendercomplete', handleRendercomplete)
    // }

    map.on('move', throttledHandleMapmove)
    map.on('movestart', handleMovestart)
    map.on('moveend', handleMoveend)

    contentBoxSize = { inlineSize: container.clientWidth, blockSize: container.clientHeight }

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentBoxSize) {
          contentBoxSize = entry.contentBoxSize[0]
        }
      }
    })

    resizeObserver.observe(container)

    mounted = true

    return () => {
      subscription.unsubscribe()
      map.removeLayer('warped-map-layer')
      map.remove()
      mounted = false
    }
  })
</script>

<div class="relative w-full h-full {$currentRound?.colors.bgClassFaded}">
  <div bind:this={container} class="w-full h-full ring-0" tabindex="-1"></div>
  {#if geoMask && contentBoxSize && !$snapshot.matches('round.progress.submitted')}
    <div class="absolute top-0 left-0 w-full h-full pointer-events-none">
      <svg viewBox={`0 0 ${contentBoxSize.inlineSize} ${contentBoxSize.blockSize}`}>
        <polygon
          bind:this={svgPolygon}
          class="fill-none stroke-[10px]"
          stroke={strokeColor}
          points={coordinatesToSvgPoints(svgCoordinates)}
        />
      </svg>
    </div>
  {/if}
  {#if geoMask && contentBoxSize && showPerfectScore && $currentRound}
    <div in:fade={{ duration: 500 }} out:fade={{ duration: 150 }}>
      <PerfectScore
        color={$currentRound.colors.color}
        width={contentBoxSize.inlineSize}
        height={contentBoxSize.blockSize}
        coordinates={svgCoordinates}
      />
    </div>
  {/if}
</div>
