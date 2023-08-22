<script lang="ts">
  import { onMount } from 'svelte'

  import OLMap from 'ol/Map.js'
  import View from 'ol/View.js'
  import TileLayer from 'ol/layer/Tile.js'
  import IIIF from 'ol/source/IIIF.js'
  import IIIFInfo from 'ol/format/IIIFInfo.js'
  import VectorSource from 'ol/source/Vector.js'
  import VectorLayer from 'ol/layer/Vector.js'
  import Feature from 'ol/feature.js'
  import Polygon from 'ol/geom/Polygon.js'

  import { gameService, currentRound, currentRoundIndex } from '$lib/shared/stores/game.js'

  import { maskStyle, maskToPolygon } from '$lib/shared/openlayers.js'
  import { colorForRounds } from '$lib/shared/colors.js'

  let element: HTMLElement

  let bgClass: string

  onMount(() => {
    if (!$currentRound || !$currentRound.loaded || $currentRoundIndex === undefined) {
      return
    }

    const tileLayer = new TileLayer()

    const vectorSource = new VectorSource()

    const roundColor = colorForRounds[$currentRoundIndex]

    bgClass = roundColor.bgClass

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: maskStyle(roundColor.color)
    })

    const feature = new Feature({
      index: 0,
      geometry: new Polygon(maskToPolygon($currentRound.map.resourceMask))
    })

    vectorSource.addFeature(feature)

    let options = new IIIFInfo($currentRound.imageInfo).getTileSourceOptions()

    if (options) {
      options.zDirection = -1

      const iiifTileSource = new IIIF(options)

      const tileGrid = iiifTileSource.getTileGrid()

      if (tileGrid) {
        const ol = new OLMap({
          target: element,
          controls: [],
          layers: [tileLayer, vectorLayer],
          keyboardEventTarget: element
        })

        tileLayer.setSource(iiifTileSource)
        ol.setView(
          new View({
            resolutions: tileGrid.getResolutions(),
            extent: tileGrid.getExtent(),
            constrainOnlyCenter: true
          })
        )
        ol.getView().fit(tileGrid.getExtent(), {
          padding: [25, 25, 25, 25]
        })

        // ol.on('rendercomplete', () => {
        //   // Done loading all tiles
        // })

        gameService.send({
          type: 'SET_OL_IMAGE',
          ol
        })

        element.focus()
      }
    }
  })
</script>

<div bind:this={element} id="ol-image" class="w-full h-full ring-0 {bgClass}" tabindex="-1" />
