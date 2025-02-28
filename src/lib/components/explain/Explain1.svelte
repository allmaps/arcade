<script lang="ts">
  import { getDeviceState } from '$lib/shared/stores/device.svelte.js'
  import { getSnapshotState } from '$lib/shared/stores/snapshot.svelte.js'

  import { isCabinet } from '$lib/shared/cabinet.js'

  import ArcadeButtonIcon from '$lib/components/ArcadeButtonIcon.svelte'

  const deviceState = getDeviceState()
  const { snapshot } = getSnapshotState()
</script>

Look at the historic map for clues about the location it depicts.

<strong
  >{#if isCabinet}
    You can always view the image again by pressing <ArcadeButtonIcon
      button={$snapshot.context.environment.getButton('toggle')}
    />.
  {:else if deviceState.isTouch}
    You can view the image again by clicking the button with the two arrows.
  {:else}
    You can view the image again by clicking the white button with the two arrows or by pressing <ArcadeButtonIcon
      button={$snapshot.context.environment.getButton('toggle')}
    />.
  {/if}</strong
>
