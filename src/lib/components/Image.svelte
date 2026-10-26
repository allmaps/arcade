<script lang="ts">
  import { onMount } from 'svelte'

  import { Map } from 'maplibre-gl'
  import { WarpedMapLayer } from '@allmaps/maplibre'
  import { webMercatorProjection } from '@allmaps/project'
  import { WarpedMapEventType } from '@allmaps/render'

  import { getSnapshotState } from '$lib/shared/stores/snapshot.svelte.js'
  import { getGameTimeoutState } from '$lib/shared/stores/game-timeout.svelte.js'
  import { makeHandleKeydownWithPanStepAndZoomFraction } from '$lib/shared/maplibre.js'
  import { MAPLIBRE_PADDING } from '$lib/shared/constants.js'

  type Props = {
    onready?: () => void
  }

  let { onready }: Props = $props()

  const { send, currentRound } = getSnapshotState()
  const gameTimeoutState = getGameTimeoutState()

  let container: HTMLElement
  const bgClass = $derived($currentRound?.colors.bgClassFaded)

  onMount(() => {
    const round = $currentRound
    if (!round?.loaded) {
      return
    }

    const map = new Map({
      container,
      style: { version: 8, sources: {}, layers: [] },
      maxPitch: 0,
      bearingSnap: 0,
      renderWorldCopies: false,
      attributionControl: false
    })

    map.dragRotate.disable()
    map.touchZoomRotate.disableRotation()
    map.touchPitch.disable()
    map.keyboard.disableRotation()
    map.keyboard.keydown = makeHandleKeydownWithPanStepAndZoomFraction(150)

    map.on('load', () => {
      const layer = new WarpedMapLayer()
      map.addLayer(layer)

      // Image tiles load independently of MapLibre's style and sources. Wait for
      // an actual image tile and its next frame before dismissing the loading screen.
      layer.renderer?.tileCache.addEventListener(
        WarpedMapEventType.FIRSTMAPTILELOADED,
        () => map.once('render', () => onready?.()),
        { once: true }
      )
      layer.addImageInfos([round.imageInfo])

      // Match Viewer's image mode: a similarity transform in Web Mercator
      // preserves the image's shape while the camera makes it upright.
      const mapId = layer.addGeoreferencedMap(round.map, {
        transformationType: 'helmert',
        internalProjection: webMercatorProjection,
        applyMask: false,
        renderAppliedMask: false,
        renderMask: true,
        renderMaskColor: round.colors.color,
        renderMaskSize: 10,
        renderMaskBorderSize: 0
      })

      const camera = layer.getMapsCenterZoomBearing([mapId], {
        padding: MAPLIBRE_PADDING,
        applyMask: true
      })
      map.jumpTo({ ...camera, padding: MAPLIBRE_PADDING })

      const element = map.getCanvas()
      send({ type: 'SET_IMAGE_KEYBOARD_TARGET', element })
      element.focus()
    })

    map.on('moveend', () => gameTimeoutState.resetLastInteraction())

    const resizeObserver = new ResizeObserver(() => map.resize())
    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
      map.remove()
    }
  })
</script>

<div
  bind:this={container}
  class="w-full h-full ring-0 [&_canvas:focus-visible]:outline-none {bgClass}"
></div>
