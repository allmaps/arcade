<script lang="ts">
  import { onMount } from 'svelte'

  import { environment } from '$lib/shared/stores/environment.js'

  import { geometryToPath } from '$lib/shared/svg.js'

  import type { GeojsonPolygon } from '@allmaps/types'

  export let geoMask: GeojsonPolygon

  export let strokeClass: string
  export let tickInterval: number

  let intervalId: number | undefined
  const scaleMultiplier = 1.4

  let scale = 1 * scaleMultiplier ** Math.round(Math.random() * 2 - 1)

  const minScale = 1 / scaleMultiplier ** 4
  const maxScale = 1 * scaleMultiplier ** 2

  function tick() {
    scale *= scaleMultiplier ** (Math.floor(Math.random() * 2) || -1)
  }

  function resetInterval() {
    clearInterval(intervalId)
    intervalId = setInterval(tick, tickInterval)
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.code === $environment.getButton('zoomIn').keyCode) {
      // Zoom in!
      if (scale < maxScale) {
        scale *= scaleMultiplier
      }
      clearInterval(intervalId)
    } else if (event.code === $environment.getButton('zoomOut').keyCode) {
      // Zoom out!
      if (scale > minScale) {
        scale /= scaleMultiplier
      }
      clearInterval(intervalId)
    }
  }

  onMount(() => {
    resetInterval()
    return () => clearInterval(intervalId)
  })
</script>

<svelte:document on:keydown={handleKeydown} />

<div class="w-full h-full transition-all duration-500">
  <svg width="100%" height="100%" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
    <!-- translate3d(0px, 0px, 1px) is needed to make sure scale transition works in Firefox -->
    <path
      vector-effect="non-scaling-stroke"
      style="transform: translate3d(0px, 0px, 1px) scale({scale * 0.55});"
      transform-origin="50 50"
      stroke-width="20"
      class="transition-all duration-300 fill-none z-0 {strokeClass}"
      d={geometryToPath(geoMask)}
    />
  </svg>
</div>
