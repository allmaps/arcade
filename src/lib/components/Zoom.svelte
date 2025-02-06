<script lang="ts">
  import Button from '$lib/components/Button.svelte'

  import { getDeviceState } from '$lib/shared/stores/device.svelte.js'
  import { getSnapshotState } from '$lib/shared/stores/snapshot.svelte.js'

  import { zoomIn, zoomOut } from '$lib/shared/keyboard.js'

  const deviceState = getDeviceState()

  const { snapshot, keyboardTarget } = getSnapshotState()

  function handleZoomIn() {
    zoomIn($keyboardTarget)
  }

  function handleZoomOut() {
    zoomOut($keyboardTarget)
  }
</script>

{#if !deviceState.isTouch}
  <Button
    button={$snapshot.context.environment.getButton('zoomOut')}
    verb="zoom out"
    onclick={handleZoomOut}
  >
    <div class="zoom-out w-full h-full bg-no-repeat bg-center"></div>
  </Button>
  <Button
    button={$snapshot.context.environment.getButton('zoomIn')}
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
