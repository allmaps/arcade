<script lang="ts">
  import { environment } from '$lib/shared/stores/environment.js'

  import { isTouchDevice } from '$lib/shared/stores/touch.js'
  import { isCabinet } from '$lib/shared/cabinet.js'

  import ArcadeButtonIcon from '$lib/components/ArcadeButtonIcon.svelte'
</script>

{#if isCabinet}
  Find the right location by moving the map with the joystick and zooming in and out with the <ArcadeButtonIcon
    button={$environment.getButton('zoomIn')}
  /> buttons.
{:else if $isTouchDevice}
  Find the right location by moving the map and zooming in.
{:else}
  Find the right location by moving the map with your mouse of with the arrow keys. You can zoom in
  and out by scrolling or with <ArcadeButtonIcon button={$environment.getButton('zoomIn')} /> and <ArcadeButtonIcon
    button={$environment.getButton('zoomOut')}
  />.
{/if}

<!--

Find the right location by moving the map with the {isCabinet ? 'joystick' : 'arrow keys'} and zooming
in and out with {#if isCabinet}
  the <ArcadeButtonIcon button={$environment.getButton('zoomIn')} /> buttons.
{:else}
  <ArcadeButtonIcon button={$environment.getButton('zoomIn')} /> and <ArcadeButtonIcon
    button={$environment.getButton('zoomOut')}
  />.
{/if}
<strong
  >Press <ArcadeButtonIcon button={$environment.getButton('submit')} /> if you have found the right location.</strong
> -->
