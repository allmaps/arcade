<script lang="ts">
  import Button from '$lib/components/Button.svelte'

  import { environment } from '$lib/shared/stores/environment.js'
  import { olTarget } from '$lib/shared/machines/game.js'
  import { zoomIn, zoomOut } from '$lib/shared/openlayers.js'

  import zoomInImage from '$lib/images/plus.svg'
  import zoomOutImage from '$lib/images/minus.svg'

  function handleZoomIn() {
    zoomIn($olTarget)
  }

  function handleZoomOut() {
    zoomOut($olTarget)
  }
</script>

<Button button={$environment.getButton('zoomOut')} verb="zoom out" on:click={handleZoomOut}>
  <div class="w-full h-full" style="background-image: url({zoomOutImage});" />
</Button>
<Button button={$environment.getButton('zoomIn')} verb="zoom in" on:click={handleZoomIn}
  ><div class="w-full h-full" style="background-image: url({zoomInImage});" /></Button
>
