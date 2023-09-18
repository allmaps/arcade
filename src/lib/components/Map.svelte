<script lang="ts">
  import { onMount } from 'svelte'

  import OLMap from 'ol/Map.js'
  import View from 'ol/View.js'
  import GeoJSON from 'ol/format/GeoJSON.js'
  import VectorTile from 'ol/layer/VectorTile.js'
  import Attribution from 'ol/control/Attribution.js'

  import { useGeographic } from 'ol/proj.js'
  import { getCenter } from 'ol/extent.js'
  import { getArea, getDistance } from 'ol/sphere.js'
  import { fromExtent } from 'ol/geom/Polygon.js'
  import LineString from 'ol/geom/LineString.js'

  import { applyStyle } from 'ol-mapbox-style'

  import { GCPTransformer } from '@allmaps/transform'
  import { WarpedMapSource, WarpedMapLayer } from '@allmaps/openlayers'

  import { geometryToPath } from '$lib/shared/geometry.js'
  import { computeScore } from '$lib/shared/score.js'

  import { gameService, currentRound, currentRoundIndex } from '$lib/shared/stores/game.js'
  import { colorForRounds } from '$lib/shared/colors.js'
  import { style } from '$lib/shared/protomaps'

  import type { Polygon } from 'geojson'

  // import { env } from '$env/dynamic/public'

  let ol: OLMap

  let geoMask: Polygon

  let element: HTMLElement
  let path: SVGPathElement

  let strokeColor: string

  let contentBoxSize: ResizeObserverSize

  function handleMoveend() {
    if (!path || !geoMask || !ol) {
      return
    }

    const svgPixelBBox = path.getBBox()
    const svgPixelCenter = [
      svgPixelBBox.x + svgPixelBBox.width / 2,
      svgPixelBBox.y + svgPixelBBox.height / 2
    ]

    const warpedMapGeoMask = new GeoJSON().readGeometry(geoMask)

    const warpedMapGeoMaskCenter = getCenter(warpedMapGeoMask.getExtent())

    const svgGeoTopLeft = ol.getCoordinateFromPixel([svgPixelBBox.x, svgPixelBBox.y])
    const svgGeoBottomRight = ol.getCoordinateFromPixel([
      svgPixelBBox.x + svgPixelBBox.width,
      svgPixelBBox.y + svgPixelBBox.height
    ])

    const warpedMapGeoMaskArea = getArea(fromExtent(warpedMapGeoMask.getExtent()))

    const svgGeoArea = getArea(
      fromExtent(new LineString([svgGeoTopLeft, svgGeoBottomRight]).getExtent())
    )

    const svgGeoCenter = ol.getCoordinateFromPixel(svgPixelCenter)

    const distance = getDistance(warpedMapGeoMaskCenter, svgGeoCenter)
    const score = computeScore(distance, warpedMapGeoMaskArea, svgGeoArea)
  }

  onMount(() => {
    if (!$currentRound || !$currentRound.loaded || $currentRoundIndex === undefined) {
      return
    }

    strokeColor = colorForRounds[$currentRoundIndex].color

    const transformer = new GCPTransformer($currentRound.map.gcps)
    geoMask = transformer.toGeoJSONPolygon($currentRound.map.resourceMask)

    const baseLayer = new VectorTile({ declutter: true })
    applyStyle(baseLayer, style)

    // const attribution = new Attribution({
    //   collapsible: false
    // })

    const warpedMapSource = new WarpedMapSource()

    const warpedMapLayer = new WarpedMapLayer({
      source: warpedMapSource
    })

    warpedMapSource.addMap($currentRound.map)

    useGeographic()

    ol = new OLMap({
      target: element,
      layers: [baseLayer, warpedMapLayer],
      controls: [],
      view: new View({
        center: [0, 0],
        maxZoom: 24,
        zoom: 2
      }),
      keyboardEventTarget: element
    })

    ol.on('moveend', handleMoveend)

    gameService.send({
      type: 'SET_OL_MAP',
      ol
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
</script>

<div class="relative w-full h-full">
  <div bind:this={element} id="ol-map" class="w-full h-full ring-0" tabindex="-1" />
  <div class="absolute top-0 left-0 w-full h-full pointer-events-none">
    {#if geoMask}
      <svg viewBox={`0 0 ${contentBoxSize.inlineSize} ${contentBoxSize.blockSize}`}>
        <path
          bind:this={path}
          class="fill-none stroke-[10px]"
          stroke={strokeColor}
          d={geometryToPath(geoMask, contentBoxSize.inlineSize, contentBoxSize.blockSize)}
        />
      </svg>
    {/if}
  </div>
</div>
