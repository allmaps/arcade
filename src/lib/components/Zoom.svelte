<script lang="ts">
  import Button from '$lib/components/Button.svelte'

  import { environment } from '$lib/shared/stores/environment.js'
  import { olTarget } from '$lib/shared/machines/game.js'
  import { zoomIn, zoomOut } from '$lib/shared/openlayers.js'

  function handleZoomIn() {
    zoomIn($olTarget)
  }

  function handleZoomOut() {
    zoomOut($olTarget)
  }
</script>

<Button button={$environment.getButton('zoomOut')} verb="zoom out" on:click={handleZoomOut}>
  <div class="zoom-out w-full h-full bg-no-repeat bg-center" />
</Button>
<Button button={$environment.getButton('zoomIn')} verb="zoom in" on:click={handleZoomIn}
  ><div class="zoom-in w-full h-full bg-no-repeat bg-center" /></Button
>

<style scoped>
  div.zoom-out {
    background-image: url($lib/images/minus.svg);
  }

  div.zoom-in {
    background-image: url($lib/images/plus.svg);
  }
</style>
