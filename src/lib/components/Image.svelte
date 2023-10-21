<script lang="ts">
  import { onMount } from 'svelte'
  import { createEventDispatcher } from 'svelte'

  import OLMap from 'ol/Map.js'
  import View from 'ol/View.js'
  import TileLayer from 'ol/layer/Tile.js'
  import IIIF from 'ol/source/IIIF.js'
  import IIIFInfo from 'ol/format/IIIFInfo.js'
  import VectorSource from 'ol/source/Vector.js'
  import VectorLayer from 'ol/layer/Vector.js'
  import Feature from 'ol/Feature.js'
  import Polygon from 'ol/geom/Polygon.js'

  import {
    gameService,
    rounds,
    currentRound,
    currentRoundIndex
  } from '$lib/shared/machines/game.js'

  import { maskStyle, maskToPolygon } from '$lib/shared/openlayers.js'
  import { PADDING } from '$lib/shared/constants.js'

  let element: HTMLElement

  let bgClass: string

  const dispatch = createEventDispatcher()

  onMount(() => {
    if (!$currentRound || !$currentRound.loaded || $currentRoundIndex === undefined) {
      return
    }

    const tileLayer = new TileLayer()

    const vectorSource = new VectorSource()

    bgClass = $currentRound.colors.bgClass

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: maskStyle($currentRound.colors.color)
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
            constrainOnlyCenter: true,
            enableRotation: false
          })
        )

        let extent = tileGrid.getExtent()
        const featureGeometry = feature.getGeometry()
        if (featureGeometry) {
          extent = featureGeometry.getExtent()
        }

        ol.getView().fit(extent, {
          padding: PADDING
        })

        ol.on('rendercomplete', () => dispatch('ready'))

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
