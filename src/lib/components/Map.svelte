<script lang="ts">
  import { onMount } from 'svelte'

  import OLMap from 'ol/Map.js'
  import View from 'ol/View.js'
  import VectorTile from 'ol/layer/VectorTile.js'
  import VectorSource from 'ol/source/Vector.js'
  import VectorLayer from 'ol/layer/Vector.js'
  import GeoJSON from 'ol/format/GeoJSON.js'
  import { Stroke, Style } from 'ol/style.js'
  import { getCenter } from 'ol/extent.js'
  import Feature from 'ol/Feature.js'
  import Polygon from 'ol/geom/Polygon.js'
  import { toLonLat } from 'ol/proj'
  import { getDistance, getArea } from 'ol/sphere.js'

  import { applyStyle } from 'ol-mapbox-style'

  import { GcpTransformer } from '@allmaps/transform'
  import { WarpedMapSource, WarpedMapLayer } from '@allmaps/openlayers'

  import { geometryToPixels, coordinatesToSvgPoints } from '$lib/shared/geometry.js'

  import { gameService, currentRound, currentRoundIndex } from '$lib/shared/machines/game.js'
  import { style } from '$lib/shared/protomaps.js'
  import { getZoomForExtent } from '$lib/shared/openlayers.js'
  import { endTime } from '$lib/shared/stores/timer.js'

  import { PADDING } from '$lib/shared/constants.js'

  import type { Polygon as GeoJsonPolygon } from 'geojson'
  import type { Submission } from '$lib/shared/types.js'

  let ol: OLMap

  let vectorSource: VectorSource
  let vectorLayer: VectorLayer<VectorSource>

  let geoMask: GeoJsonPolygon

  let element: HTMLElement
  let svgPolygon: SVGPathElement | undefined
  let svgCoordinates: [number, number][] = []

  let strokeColor: string

  let contentBoxSize: ResizeObserverSize | undefined

  let pulsateDuration = 0.5

  let warpedMapCenter: number[]
  let warpedMapZoom: number

  let submitted = false

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

  export function getSubmission(): Submission {
    const warpedMapZoom = getWarpedMapZoom()
    const submissionZoom = getSubmissionZoom()

    const warpedMapCenter = getWarpedMapCenter()
    const submissionCenter = getSubmissionCenter()

    return {
      area: getArea(
        new GeoJSON().readGeometry(geoMask, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857'
        })
      ),
      zoom: {
        warpedMap: warpedMapZoom,
        submission: submissionZoom
      },
      center: {
        warpedMap: warpedMapCenter,
        submission: submissionCenter
      },
      distance: getDistance(warpedMapCenter, submissionCenter)
    }
  }

  gameService.onTransition((state) => {
    if (state.event.type === 'SUBMIT') {
      submitted = true

      const geoCoordinates = svgCoordinates.map((coordinate) =>
        ol.getCoordinateFromPixel(coordinate)
      )

      const feature = new Feature({
        geometry: new Polygon([geoCoordinates])
      })

      feature.setId('submission')

      vectorSource.addFeature(feature)

      // TODO: rename!!!
      const f2 = new Feature(
        new GeoJSON().readGeometry(geoMask, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:3857'
        })
      )

      vectorSource.addFeature(f2)

      const warpedMapZoom = getWarpedMapZoom()
      const submissionZoom = getSubmissionZoom()

      const durationPerZoomLevel = 200
      const duration = Math.abs(warpedMapZoom - submissionZoom) * durationPerZoomLevel

      ol.getView().fit(getGeoMaskExtent(), {
        maxZoom: Math.max(warpedMapZoom - 1, submissionZoom),
        padding: PADDING,
        duration
      })

      ol.getInteractions().clear()
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

    const transformer = new GcpTransformer($currentRound.map.gcps)
    geoMask = transformer.transformToGeoAsGeojson([$currentRound.map.resourceMask])

    const baseLayer = new VectorTile({ declutter: true, maxZoom: 20 })
    applyStyle(baseLayer, style)

    const warpedMapSource = new WarpedMapSource()
    const warpedMapLayer = new WarpedMapLayer({
      source: warpedMapSource
    })
    warpedMapLayer.setOpacity(0)

    warpedMapSource.addMap($currentRound.map)

    vectorSource = new VectorSource()
    vectorLayer = new VectorLayer({
      source: vectorSource,
      style: (feature) => {
        const isSubmission = feature.getId() === 'submission'

        return new Style({
          stroke: new Stroke({
            color: strokeColor,
            lineDash: isSubmission ? [40, 40] : undefined,
            width: 10
          })
          // fill: new Fill({
          //   color: 'rgba(255, 255, 255, 0.0)'
          // })
        })
      }
    })

    ol = new OLMap({
      target: element,
      // @ts-ignore
      layers: [baseLayer, warpedMapLayer, vectorLayer],
      controls: [],
      view: new View({
        center: [0, 0],
        maxZoom: 24,
        zoom: 2,
        enableRotation: false
      }),
      keyboardEventTarget: element
    })

    gameService.send({
      type: 'SET_OL_MAP',
      ol
    })

    warpedMapCenter = getWarpedMapCenter()
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

      // pulsateDuration = 1 / (distanceRatio * areaRatio * 8)
      // const mapSize = ol.getSize()
      // const mapPixelCenter = [mapSize[0] / 2, mapSize[1] / 2]
      // const warpedMapPixelCenter = ol.getPixelFromCoordinate(getCenter(getGeoMaskExtent()))
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
              padding: PADDING,
              duration: 200,
              callback: handleSubmit
            })
          }
        }
      }

      return () => {
        warpedMapLayer.dispose()
        warpedMapSource.dispose()
      }
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
  })

  // stroke-linejoin="round"
  // stroke-linecap="round"
</script>

<div class="relative w-full h-full">
  <div bind:this={element} id="ol-map" class="w-full h-full ring-0" tabindex="-1" />
  {#if geoMask && contentBoxSize && !$gameService.matches('round.progress.submitted')}
    <div class="absolute top-0 left-0 w-full h-full pointer-events-none">
      <svg viewBox={`0 0 ${contentBoxSize.inlineSize} ${contentBoxSize.blockSize}`}>
        <polygon
          id="geo-mask"
          style="--animation-duration: {pulsateDuration}s;"
          bind:this={svgPolygon}
          class="fill-none stroke-[10px]"
          stroke={strokeColor}
          points={coordinatesToSvgPoints(svgCoordinates)}
        />
      </svg>
    </div>
  {/if}
</div>

<style>
  #geo-mask {
    /* animation-duration: var(--animation-duration); */
    animation-name: pulsate;
    animation-iteration-count: infinite;
    animation-direction: alternate;
    animation-timing-function: linear;
  }

  @keyframes pulsate {
    from {
      scale: 0.9;
    }

    to {
      scale: 1;
    }
  }
</style>
