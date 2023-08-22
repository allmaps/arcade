<script lang="ts">
  import { onMount } from 'svelte'

  import OLMap from 'ol/Map.js'
  import View from 'ol/View.js'
  import XYZ from 'ol/source/XYZ.js'
  import TileLayer from 'ol/layer/Tile.js'
  import GeoJSON from 'ol/format/GeoJSON.js'

  import { GCPTransformer } from '@allmaps/transform'
  import { WarpedMapSource, WarpedMapLayer } from '@allmaps/openlayers'

  import { geometryToPath } from '$lib/shared/geometry.js'

  import { gameService, currentRound, currentRoundIndex } from '$lib/shared/stores/game.js'
  import { colorForRounds } from '$lib/shared/colors.js'

  import type { Polygon } from 'geojson'

  // import { env } from '$env/dynamic/public'

  let ol: OLMap

  let geoMask: Polygon

  let element: HTMLElement
  let path: SVGPathElement

  let strokeColor: string

  let contentBoxSize: ResizeObserverSize

  function getDistance(a: number[], b: number[]) {
    return Math.sqrt(Math.pow(a[0] - b[0], 2) + Math.pow(a[1] - b[1], 2))
  }

  function handleMoveend() {
    if (!path || !geoMask || !ol) {
      return
    }
    // pak bbox van geomask
    // geometryToPath van bbox

    const svgPixelBBox = path.getBBox()
    const svgPixelTopLeft = [svgPixelBBox.x, svgPixelBBox.y]
    const svgPixelBottomRight = [
      svgPixelBBox.x + svgPixelBBox.width,
      svgPixelBBox.y + svgPixelBBox.height
    ]

    const warpedMapGeoBBox = new GeoJSON()
      .readGeometry(geoMask, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      })
      .getExtent()

    const warpedMapPixelTopLeft = ol.getPixelFromCoordinate([
      warpedMapGeoBBox[0],
      warpedMapGeoBBox[3]
    ])
    const warpedMapPixelBottomRight = ol.getPixelFromCoordinate([
      warpedMapGeoBBox[2],
      warpedMapGeoBBox[1]
    ])

    const distance =
      (getDistance(warpedMapPixelTopLeft, svgPixelTopLeft) +
        getDistance(warpedMapPixelBottomRight, svgPixelBottomRight)) /
      2

    console.log('Distance:', distance)
  }

  onMount(() => {
    if (!$currentRound || !$currentRound.loaded || $currentRoundIndex === undefined) {
      return
    }

    strokeColor = colorForRounds[$currentRoundIndex].color

    const transformer = new GCPTransformer($currentRound.map.gcps)
    geoMask = transformer.toGeoJSONPolygon($currentRound.map.resourceMask)

    const tileSource = new XYZ({
      url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
      maxZoom: 19
    })

    const tileLayer = new TileLayer({
      source: tileSource
    })

    const warpedMapSource = new WarpedMapSource()

    const warpedMapLayer = new WarpedMapLayer({
      source: warpedMapSource
    })

    warpedMapSource.addMap($currentRound.map)

    ol = new OLMap({
      target: element,
      layers: [tileLayer, warpedMapLayer],
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
