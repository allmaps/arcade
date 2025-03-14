<script lang="ts">
  import { onMount } from 'svelte'

  import OLMap from 'ol/Map.js'
  import View from 'ol/View.js'
  import TileLayer from 'ol/layer/Tile.js'
  import IIIFSource from 'ol/source/IIIF.js'
  import IIIFInfo from 'ol/format/IIIFInfo.js'
  import VectorSource from 'ol/source/Vector.js'
  import VectorLayer from 'ol/layer/Vector.js'
  import Feature from 'ol/Feature.js'
  import Polygon from 'ol/geom/Polygon.js'

  import { getSnapshotState } from '$lib/shared/stores/snapshot.svelte.js'
  import { getGameTimeoutState } from '$lib/shared/stores/game-timeout.svelte.js'

  import { maskStyle, maskToPolygon } from '$lib/shared/openlayers.js'
  import { PADDING } from '$lib/shared/constants.js'

  type Props = {
    onready?: () => void
  }

  let { onready }: Props = $props()

  const { send, currentRound, currentRoundIndex } = getSnapshotState()
  const gameTimeoutState = getGameTimeoutState()

  let element: HTMLElement

  let bgClass: string | undefined = $derived($currentRound?.colors.bgClassFaded)

  onMount(() => {
    if (!$currentRound || !$currentRound.loaded || currentRoundIndex === undefined) {
      return
    }

    const tileLayer = new TileLayer()

    const vectorSource = new VectorSource()

    const vectorLayer = new VectorLayer({
      source: vectorSource,
      style: maskStyle($currentRound.colors.color),
      updateWhileAnimating: true,
      updateWhileInteracting: true
    })

    const feature = new Feature({
      index: 0,
      geometry: new Polygon(maskToPolygon($currentRound.map.resourceMask))
    })

    vectorSource.addFeature(feature)

    let options = new IIIFInfo($currentRound.imageInfo).getTileSourceOptions()

    if (options) {
      options.zDirection = -1
      const iiifTileSource = new IIIFSource(options)

      const tileGrid = iiifTileSource.getTileGrid()

      if (tileGrid) {
        const ol = new OLMap({
          target: element,
          controls: [],
          layers: [tileLayer, vectorLayer],
          view: new View({
            padding: PADDING,
            enableRotation: false
          }),
          keyboardEventTarget: element
        })

        tileLayer.setSource(iiifTileSource)

        let extent = tileGrid.getExtent()
        const featureGeometry = feature.getGeometry()
        if (featureGeometry) {
          extent = featureGeometry.getExtent()
        }

        ol.getView().fit(extent, {
          // padding: PADDING
        })

        ol.on('rendercomplete', () => onready?.())

        send({
          type: 'SET_IMAGE_KEYBOARD_TARGET',
          element,
          library: 'openlayers'
        })

        element.focus()

        ol.on('moveend', () => gameTimeoutState.resetLastInteraction())
      }
    }
  })
</script>

<div bind:this={element} class="w-full h-full ring-0 {bgClass}" tabindex="-1"></div>
