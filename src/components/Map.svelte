<script>
  import { onMount, onDestroy } from 'svelte'
  // import { writable, derived } from 'svelte/store'

  import 'ol/ol.css'
  import Map from 'ol/Map.js'
  import TileLayer from 'ol/layer/Tile.js'
  import VectorLayer from 'ol/layer/Vector.js'
  import OSM from 'ol/source/OSM.js'

  import VectorSource from 'ol/source/Vector.js'
  import Style from 'ol/style/Style.js'
  import Stroke from 'ol/style/Stroke.js'
  import GeoJSON from 'ol/format/GeoJSON.js'

  import View from 'ol/View.js'

  import { createTransformer, polygonToWorld } from '@allmaps/transform'
  import { geoMercator, geoPath } from 'd3-geo'

  export let georef
  export let tiles
  export let tick

  let resizeObserver

  let olContainer
  let container

  let map
  let vectorSource

  let geoMask
  let geoTiles = []
  let path

  let width
  let height

  $: {
    if (georef && vectorSource) {
      const transformArgs = createTransformer(georef.gcps)
      geoMask = polygonToWorld(transformArgs, georef.pixelMask.slice().reverse())

      geoTiles = tiles
        .map((tile) => polygonToWorld(transformArgs, tileToPolygon(tile)))

      vectorSource.addFeature((new GeoJSON()).readFeature(geoMask, { featureProjection: 'EPSG:3857' }))

      geoTiles.forEach((geoTile) => {
        vectorSource.addFeature((new GeoJSON()).readFeature(geoTile, { featureProjection: 'EPSG:3857' }))
      })

      const projection = geoMercator().fitSize([width, height], geoMask)
      path = geoPath().projection(projection)
    }
  }


  function tileToPolygon ({x, y, width, height}) {
    return [
      [x, y],
      [x + width, y],
      [x + width, y + height],
      [x, y + height],
      [x, y]
    ]
  }

  onMount(async () => {
    const resizeObserver = new ResizeObserver(([entry]) => {
      width = entry.contentRect.width
      height = entry.contentRect.height
		})

    resizeObserver.observe(container)

    const view = new View({
      center: [0, 0],
      zoom: 2
    })

    const tileLayer = new TileLayer({
      source: new OSM()
    })

    vectorSource = new VectorSource()
    let vectorLayer = new VectorLayer({
      source: vectorSource,
      style: new Style({
        stroke: new Stroke({
          color: 'rgb(48, 93, 79)',
          width: 3
        })
      })
    })

    map = new Map({
      target: olContainer,
      view,
      layers: [tileLayer, vectorLayer]
    })
  })

  onDestroy(() => {
    if (resizeObserver) {
      resizeObserver.disconnect()
    }
  })
</script>

<div class="container" bind:this={container}>
  <div class="ol-container zoom-controls-bottom-left" bind:this={olContainer} />
  <div class="svg-container">
    {#if path && width && height}
      <svg viewBox={`0 0 ${width} ${height}`}>
        <!-- width={`${width}px`} height={`${height}px`}> -->
        <path class="geo-mask" d={path(geoMask)} />
        <g class="tiles">
        	{#each geoTiles as geoTile, index}
            <path d={path(geoTile)} class:visible="{index <= tick}" />
          {/each}
        </g>
      </svg>
    {/if}
  </div>
</div>

<style>
.container {
  position: absolute;
  width: 100%;
  height: 100%;
}

.container > * {
  position: absolute;
  top: 0;
  width: 100%;
  height: 100%;
}

.svg-container {
  pointer-events: none;
}

.svg-container svg {
  padding: 50px;
}

svg .geo-mask {
  fill: none;
  stroke: purple;
  stroke-width: 0.5px;
}

svg .tiles path {
  stroke: purple;
  stroke-width: 2px;
  fill: purple;
  fill-opacity: 0.03;
  transition: fill-opacity 1s;
}

svg .tiles path.visible {
  fill-opacity: 0.3;
}
</style>