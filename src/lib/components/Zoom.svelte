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

<Button button={$environment.getButton('zoomOut')} verb="zoom out" on:click={handleZoomOut}
  ><img class="w-full" src={zoomOutImage} alt="Zoom out" /></Button
>
<Button button={$environment.getButton('zoomIn')} verb="zoom in" on:click={handleZoomIn}
  ><img class="w-full" src={zoomInImage} alt="Zoom in" /></Button
>
