<script lang="ts">
  import { onMount } from 'svelte'

  import OLMap from 'ol/Map.js'
  import View from 'ol/View.js'
  import VectorTile from 'ol/layer/VectorTile.js'
  import VectorSource from 'ol/source/Vector.js'
  import VectorLayer from 'ol/layer/Vector.js'
  import GeoJSON from 'ol/format/GeoJSON.js'
  import { getCenter } from 'ol/extent.js'
  import Feature from 'ol/Feature.js'
  import Polygon from 'ol/geom/Polygon.js'
  import { fromLonLat, toLonLat } from 'ol/proj'
  import { getDistance, getArea } from 'ol/sphere.js'

  import { applyStyle } from 'ol-mapbox-style'

  import { WarpedMapSource, WarpedMapLayer } from '@allmaps/openlayers'

  import { geometryToPixels, coordinatesToSvgPoints, getConvexHull } from '$lib/shared/geometry.js'
  import {
    gameService,
    currentRound,
    currentRoundIndex,
    configuration
  } from '$lib/shared/machines/game.js'
  import { style as protomapsStyle } from '$lib/shared/protomaps.js'
  import {
    maskStyle,
    convexHullStyle,
    getExtent,
    getZoomForExtent,
    flyTo
  } from '$lib/shared/openlayers.js'
  import { endTime } from '$lib/shared/stores/timer.js'
  import { resetLastInteraction } from '$lib/shared/stores/game-timeout.js'
  import { computeZoomRatio, computeDistanceRatio } from '$lib/shared/score.js'

  import { PADDING } from '$lib/shared/constants.js'

  import type { Polygon as GeoJsonPolygon } from 'geojson'

  import type { LoadedRound, Submission, DoneFn } from '$lib/shared/types.js'

  let ol: OLMap

  let submissionVectorSource: VectorSource
  let submissionVectorLayer: VectorLayer<VectorSource>

  let convexHullVectorSource: VectorSource
  let convexHullVectorLayer: VectorLayer<VectorSource>

  let element: HTMLElement
  let svgPolygon: SVGPathElement | undefined
  let svgCoordinates: [number, number][] = []

  let strokeColor: string

  let contentBoxSize: ResizeObserverSize | undefined

  let warpedMapZoom: number

  let submitted = false

  const geoMask = ($currentRound as LoadedRound).geoMask

  let convexHull: GeoJsonPolygon | undefined
  let submittedGeoMask: GeoJsonPolygon | undefined

  function getWarpedMapCenter() {
    return toLonLat(getCenter(getExtent(geoMask)))
  }

  function getSubmissionCenter() {
    const view = ol.getView()
    const center = view.getCenter()
    if (center) {
      return toLonLat(center)
    }

    return [0, 0]
  }

  function getWarpedMapPixelCenter() {
    return ol.getPixelFromCoordinate(getCenter(getExtent(geoMask)))
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
    return getZoomForExtent(ol, getExtent(geoMask), PADDING) || 0
  }

  function getSubmissionZoom() {
    const view = ol.getView()
    return view.getZoom() || 0
  }

  export function flyToSubmission(duration?: number, done?: DoneFn) {
    if (convexHull && submittedGeoMask) {
      flyTo(ol.getView(), [getExtent(convexHull), getExtent(submittedGeoMask)], duration, done)
    }
  }

  export function flyToWarpedMap(duration?: number, done?: DoneFn) {
    if (convexHull && geoMask) {
      flyTo(ol.getView(), [getExtent(convexHull), getExtent(geoMask)], duration, done)
    }
  }

  function getSubmittedGeoMask(): GeoJsonPolygon {
    const submittedGeoMaskPolygon = new Polygon([
      [...svgCoordinates, svgCoordinates[0]].map((coordinate) =>
        ol.getCoordinateFromPixel(coordinate)
      )
    ])

    const submittedGeoMask = new GeoJSON().writeGeometryObject(submittedGeoMaskPolygon, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    })

    if (submittedGeoMask.type !== 'Polygon') {
      throw new Error('Submitted geoMask is not a polygon')
    }

    return submittedGeoMask
  }

  export function getSubmission(found = false): Submission {
    const warpedMapZoom = getWarpedMapZoom()
    const submissionZoom = getSubmissionZoom()

    const warpedMapCenter = getWarpedMapCenter()
    const submissionCenter = getSubmissionCenter()

    submittedGeoMask = getSubmittedGeoMask()
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

    return {
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
      found
    }
  }

  function handleTransition(state: typeof gameService.state) {
    if (state.event.type === 'SUBMIT') {
      submitted = true

      // Add submittedGeoMask to map

      // submittedGeoMask should already been set. Throw error otherwise
      if (!submittedGeoMask || !convexHull) {
        throw new Error('No submittedGeoMask or no convexHull')
      }

      const submittedGeoMaskFeature = new Feature({
        geometry: new GeoJSON().readGeometry(submittedGeoMask, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857'
        })
      })

      submissionVectorSource.addFeature(submittedGeoMaskFeature)

      // Add convex hull of geoMask and submittedGeoMask to map
      const convexHullFeature = new Feature({
        geometry: new GeoJSON().readGeometry(convexHull, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857'
        })
      })

      convexHullVectorSource.addFeature(convexHullFeature)

      if (convexHull && geoMask) {
        flyToWarpedMap(4000, () => gameService.send('FINISHED'))
      }

      // ol.getInteractions().clear()
    }
  }

  $: {
    if (contentBoxSize) {
      svgCoordinates = geometryToPixels(
        geoMask,
        [contentBoxSize.inlineSize, contentBoxSize.blockSize],
        PADDING
      )
    }
  }

  function handleSubmit() {
    gameService.send({
      type: 'SUBMIT',
      endTime: $endTime,
      submission: getSubmission(true)
    })
  }

  onMount(() => {
    if (!$currentRound || !$currentRound.loaded || $currentRoundIndex === undefined) {
      return
    }

    strokeColor = $currentRound.colors.color

    const baseLayer = new VectorTile({ declutter: true, maxZoom: 20 })
    applyStyle(baseLayer, protomapsStyle)

    const warpedMapSource = new WarpedMapSource()
    const warpedMapLayer = new WarpedMapLayer({
      source: warpedMapSource
    })
    warpedMapLayer.setOpacity(0)

    warpedMapSource.addGeoreferencedMap($currentRound.map)

    submissionVectorSource = new VectorSource()
    submissionVectorLayer = new VectorLayer({
      source: submissionVectorSource,
      style: maskStyle(strokeColor),
      updateWhileAnimating: true,
      updateWhileInteracting: true
    })

    convexHullVectorSource = new VectorSource()
    convexHullVectorLayer = new VectorLayer({
      source: convexHullVectorSource,
      style: convexHullStyle($currentRound.colors.convexHullColor),
      updateWhileAnimating: true,
      updateWhileInteracting: true
    })

    ol = new OLMap({
      target: element,
      // @ts-ignore
      layers: [baseLayer, convexHullVectorLayer, warpedMapLayer, submissionVectorLayer],
      controls: [],
      view: new View({
        center: fromLonLat($configuration.map.center),
        padding: PADDING,
        enableRotation: false
      }),
      keyboardEventTarget: element
    })

    gameService.send({
      type: 'SET_OL_MAP',
      ol
    })

    gameService.onTransition(handleTransition)

    warpedMapZoom = getWarpedMapZoom()

    const fraction = warpedMapZoom % 1

    const view = ol.getView()

    const minZoom = $configuration.map.initialZoom + fraction

    const maxZoom = warpedMapZoom + 4

    view.setMinZoom(minZoom)
    view.setMaxZoom(maxZoom)

    view.setZoom(minZoom)

    ol.on('postrender', () => {
      if (submitted) {
        warpedMapLayer.setOpacity(1)
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
    })

    ol.on('movestart', () => {
      if (submitted) {
        gameService.send('MAP_MOVED')
      }
    })

    ol.on('moveend', () => {
      const submissionZoom = getSubmissionZoom()

      const zoomDiff = Math.abs(submissionZoom - warpedMapZoom)

      // en center bijna gelijk aan 128 px
      // https://github.com/openlayers/openlayers/blob/be95fd71b6edeeb947411db740d839ae9d455dd4/src/ol/interaction/KeyboardPan.js#L75C63-L75C66

      const zoomDiffPerfectScore = 0.1
      const distanceThreshold = 128 + 10

      if (zoomDiff < zoomDiffPerfectScore) {
        const warpedMapPixelCenter = getWarpedMapPixelCenter()
        const submissionPixelCenter = getSubmissionPixelCenter()

        if (warpedMapPixelCenter && submissionPixelCenter) {
          const distanceX = Math.abs(warpedMapPixelCenter[0] - submissionPixelCenter[0])
          const distanceY = Math.abs(warpedMapPixelCenter[1] - submissionPixelCenter[1])

          if (distanceX < distanceThreshold && distanceY < distanceThreshold) {
            ol.getView().fit(getExtent(geoMask), {
              duration: 200,
              callback: handleSubmit
            })
          }
        }
      }

      resetLastInteraction()
    })

    contentBoxSize = { inlineSize: element.clientWidth, blockSize: element.clientHeight }

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentBoxSize) {
          contentBoxSize = entry.contentBoxSize[0]
        }
      }
    })

    resizeObserver.observe(element)

    return () => {
      warpedMapLayer.dispose()
      warpedMapSource.dispose()

      gameService.off(handleTransition)
    }
  })
</script>

<div class="relative w-full h-full bg-[#e0e0e0]">
  <div bind:this={element} id="ol-map" class="w-full h-full ring-0" tabindex="-1" />
  {#if geoMask && contentBoxSize && !$gameService.matches('round.progress.submitted')}
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
</div>
