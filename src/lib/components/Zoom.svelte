<script lang="ts">
  import Button from '$lib/components/Button.svelte'

  import { getDeviceState } from '$lib/shared/stores/device.svelte.js'
  import { getSnapshotState } from '$lib/shared/stores/snapshot.svelte.js'

  import { getMapControlsState } from '$lib/shared/stores/map-controls.svelte.js'

  const deviceState = getDeviceState()

  const { snapshot } = getSnapshotState()
  const mapControlsState = getMapControlsState()

  function handleZoomIn() {
    mapControlsState.activeControls?.zoomIn()
  }

  function handleZoomOut() {
    mapControlsState.activeControls?.zoomOut()
  }
</script>

{#if !deviceState.isTouch}
  <Button
    button={$snapshot.context.environment.getButton('zoomOut')}
    keyboardClick={false}
    verb="zoom out"
    onclick={handleZoomOut}
  >
    <div class="zoom-out w-full h-full bg-no-repeat bg-center"></div>
  </Button>
  <Button
    button={$snapshot.context.environment.getButton('zoomIn')}
    keyboardClick={false}
    verb="zoom in"
    onclick={handleZoomIn}><div class="zoom-in w-full h-full bg-no-repeat bg-center"></div></Button
  >
{/if}

<style scoped>
  div.zoom-out {
    background-image: url($lib/images/minus.svg);
  }

  div.zoom-in {
    background-image: url($lib/images/plus.svg);
  }
</style>
