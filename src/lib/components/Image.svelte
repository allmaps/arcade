<script lang="ts">
  import { onMount } from 'svelte'

  import { WarpedMapLayer } from '@allmaps/maplibre'
  import { webMercatorProjection } from '@allmaps/project'
  import { WarpedMapEventType } from '@allmaps/render'

  import { getSnapshotState } from '$lib/shared/stores/snapshot.svelte.js'
  import { getGameTimeoutState } from '$lib/shared/stores/game-timeout.svelte.js'
  import { createArcadeMap } from '$lib/shared/maplibre.js'
  import { getMapControlsState } from '$lib/shared/stores/map-controls.svelte.js'
  import { MAPLIBRE_PADDING } from '$lib/shared/constants.js'

  type Props = {
    onready?: () => void
  }

  let { onready }: Props = $props()

  const { currentRound } = getSnapshotState()
  const gameTimeoutState = getGameTimeoutState()
  const mapControlsState = getMapControlsState()

  let container: HTMLElement
  const bgClass = $derived($currentRound?.colors.bgClassFaded)

  onMount(() => {
    const round = $currentRound
    if (!round?.loaded) {
      return
    }

    const view = createArcadeMap({ container, basemap: false, renderWorldCopies: false })
    const { map, controls } = view
    const unregisterControls = mapControlsState.register('image', map, controls)

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
    })

    map.on('moveend', () => gameTimeoutState.resetLastInteraction())

    return () => {
      unregisterControls()
      view.destroy()
    }
  })
</script>

<div
  bind:this={container}
  class="w-full h-full ring-0 [&_canvas:focus-visible]:outline-none {bgClass}"
></div>
