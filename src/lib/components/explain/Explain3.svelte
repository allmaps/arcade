<script lang="ts">
  import { getDeviceState } from '$lib/shared/stores/device.svelte.js'
  import { getSnapshotState } from '$lib/shared/stores/snapshot.svelte.js'

  import { isCabinet } from '$lib/shared/cabinet.js'

  import ArcadeButtonIcon from '$lib/components/ArcadeButtonIcon.svelte'

  const deviceState = getDeviceState()
  const { snapshot } = getSnapshotState()
</script>

<p>
  <strong
    >{#if isCabinet}
      Press <ArcadeButtonIcon button={$snapshot.context.environment.getButton('submit')} /> if you have
      found the right location.
    {:else if deviceState.isTouch}
      Click Submit if you have found the right location.
    {:else}
      Click Submit or press <ArcadeButtonIcon
        button={$snapshot.context.environment.getButton('submit')}
      /> if you have found the right location.
    {/if}</strong
  >
</p>

<p>The quicker you are and the better your guess is, the more points you'll earn.</p>
