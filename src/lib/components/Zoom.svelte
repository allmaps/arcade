<script lang="ts">
  import Button from '$lib/components/Button.svelte'

  import { isTouchDevice } from '$lib/shared/stores/touch.js'
  import { environment } from '$lib/shared/stores/environment.js'

  import { keyboardTarget } from '$lib/shared/machines/game.js'
  import { zoomIn, zoomOut } from '$lib/shared/keyboard.js'

  function handleZoomIn() {
    zoomIn($keyboardTarget)
  }

  function handleZoomOut() {
    zoomOut($keyboardTarget)
  }
</script>

{#if !$isTouchDevice}
  <Button button={$environment.getButton('zoomOut')} verb="zoom out" on:click={handleZoomOut}>
    <div class="zoom-out w-full h-full bg-no-repeat bg-center" />
  </Button>
  <Button button={$environment.getButton('zoomIn')} verb="zoom in" on:click={handleZoomIn}
    ><div class="zoom-in w-full h-full bg-no-repeat bg-center" /></Button
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
