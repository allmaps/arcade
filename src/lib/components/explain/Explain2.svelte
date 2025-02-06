<script lang="ts">
  import { getDeviceState } from '$lib/shared/stores/device.svelte.js'
  import { getSnapshotState } from '$lib/shared/stores/snapshot.svelte.js'

  import { isCabinet } from '$lib/shared/cabinet.js'

  import ArcadeButtonIcon from '$lib/components/ArcadeButtonIcon.svelte'

  const deviceState = getDeviceState()
  const { snapshot } = getSnapshotState()
</script>

{#if isCabinet}
  Find the right location by moving the map with the joystick and zooming in and out with the <ArcadeButtonIcon
    button={$snapshot.context.environment.getButton('zoomIn')}
  /> buttons.
{:else if deviceState.isTouch}
  Find the right location by moving the map and zooming in.
{:else}
  Find the right location by moving the map with your mouse of with the arrow keys. You can zoom in
  and out by scrolling or with <ArcadeButtonIcon
    button={$snapshot.context.environment.getButton('zoomIn')}
  /> and <ArcadeButtonIcon button={$snapshot.context.environment.getButton('zoomOut')} />.
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
