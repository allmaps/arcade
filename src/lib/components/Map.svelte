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
  import { toLonLat } from 'ol/proj'
  import { getDistance, getArea } from 'ol/sphere.js'

  import { applyStyle } from 'ol-mapbox-style'

  import { WarpedMapSource, WarpedMapLayer } from '@allmaps/openlayers'

  import { geometryToPixels, coordinatesToSvgPoints, getConvexHull } from '$lib/shared/geometry.js'

  import { gameService, currentRound, currentRoundIndex } from '$lib/shared/machines/game.js'
  import { style as protomapsStyle } from '$lib/shared/protomaps.js'
  import { maskStyle, convexHullStyle, getZoomForExtent, flyTo } from '$lib/shared/openlayers.js'
  import { endTime } from '$lib/shared/stores/timer.js'
  import { resetLastInteraction } from '$lib/shared/stores/game-timeout.js'

  import { PADDING } from '$lib/shared/constants.js'

  import type { Polygon as GeoJsonPolygon } from 'geojson'

  import type { LoadedRound, Submission } from '$lib/shared/types.js'

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

  function getGeoMaskExtent() {
    const warpedMapGeoMask = new GeoJSON().readGeometry(geoMask, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    })

    return warpedMapGeoMask.getExtent()
  }

  function getWarpedMapCenter() {
    return toLonLat(getCenter(getGeoMaskExtent()))
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
    return ol.getPixelFromCoordinate(getCenter(getGeoMaskExtent()))
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
    return getZoomForExtent(ol, getGeoMaskExtent(), PADDING) || 0
  }

  function getSubmissionZoom() {
    const view = ol.getView()
    return view.getZoom() || 0
  }

  export function flyToSubmission() {
    const feature = submissionVectorSource.getFeatureById('submission')
    const extent = feature?.getGeometry()?.getExtent()

    if (extent) {
      flyTo(ol.getView(), extent, 2000)
    }
  }

  export function flyToWarpedMap() {
    const submissionZoom = getSubmissionZoom()

    const durationPerZoomLevel = 200
    const duration = Math.abs(warpedMapZoom - submissionZoom) * durationPerZoomLevel

    flyTo(ol.getView(), getGeoMaskExtent(), duration)
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

  export function getSubmission(): Submission {
    const warpedMapZoom = getWarpedMapZoom()
    const submissionZoom = getSubmissionZoom()

    const warpedMapCenter = getWarpedMapCenter()
    const submissionCenter = getSubmissionCenter()

    const submittedGeoMask = getSubmittedGeoMask()
    const area = getArea(
      new GeoJSON().readGeometry(submittedGeoMask, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      })
    )

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
      convexHull: getConvexHull(geoMask, submittedGeoMask)
    }
  }

  gameService.onTransition((state) => {
    if (state.event.type === 'SUBMIT') {
      submitted = true

      // Add submittedGeoMask to map
      const submittedGeoMask = getSubmittedGeoMask()
      const submittedGeoMaskFeature = new Feature({
        geometry: new GeoJSON().readGeometry(submittedGeoMask, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857'
        })
      })

      submittedGeoMaskFeature.setId('submission')
      submissionVectorSource.addFeature(submittedGeoMaskFeature)

      // Add convex hull of geoMask and submittedGeoMask to map
      const convexHull = getConvexHull(geoMask, submittedGeoMask)
      const convexHullFeature = new Feature({
        geometry: new GeoJSON().readGeometry(convexHull, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857'
        })
      })

      convexHullFeature.setId('convexhull')
      convexHullVectorSource.addFeature(convexHullFeature)

      const warpedMapZoom = getWarpedMapZoom()
      const submissionZoom = getSubmissionZoom()

      const durationPerZoomLevel = 200
      const duration = Math.abs(warpedMapZoom - submissionZoom) * durationPerZoomLevel

      flyTo(ol.getView(), getGeoMaskExtent(), duration)

      // ol.getInteractions().clear()
    }
  })

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
      submission: getSubmission()
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
        center: [0, 0],
        maxZoom: 24,
        zoom: 2,
        padding: PADDING,
        enableRotation: false

        // extent: [-572513.341856, 5211017.966314, 916327.095083, 6636950.728974],
      }),
      keyboardEventTarget: element
    })

    gameService.send({
      type: 'SET_OL_MAP',
      ol
    })

    warpedMapZoom = getWarpedMapZoom()

    const fraction = warpedMapZoom % 1

    const view = ol.getView()

    const minZoom = 3 + fraction
    const maxZoom = warpedMapZoom + 2

    view.setMinZoom(minZoom)
    view.setMaxZoom(maxZoom)

    view.setZoom(minZoom)

    ol.on('postrender', () => {
      if (submitted) {
        warpedMapLayer.setOpacity(1)
        return
      }

      const submissionZoom = getSubmissionZoom()
      const submissionCenter = getSubmissionCenter()

      if (!submissionZoom || !submissionCenter) {
        return
      }

      const zoomDiff = Math.abs(submissionZoom - warpedMapZoom)
      const zoomDiffVisible = 2

      if (zoomDiff < zoomDiffVisible) {
        const opacity = 1 - zoomDiff / zoomDiffVisible
        warpedMapLayer.setOpacity(opacity)
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
            console.log('PERFECT SCORE')

            ol.getView().fit(getGeoMaskExtent(), {
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
