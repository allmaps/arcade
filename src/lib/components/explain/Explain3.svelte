<script lang="ts">
  import { environment } from '$lib/shared/stores/environment.js'

  import { isTouchDevice } from '$lib/shared/stores/touch.js'
  import { isCabinet } from '$lib/shared/cabinet.js'

  import ArcadeButtonIcon from '$lib/components/ArcadeButtonIcon.svelte'
</script>

<p>
  <strong
    >{#if isCabinet}
      Press <ArcadeButtonIcon button={$environment.getButton('submit')} /> if you have found the right
      location.
    {:else if $isTouchDevice}
      Click Submit if you have found the right location.
    {:else}
      Click Submit or press <ArcadeButtonIcon button={$environment.getButton('submit')} /> if you have
      found the right location.
    {/if}</strong
  >
</p>

<p>The quicker you are and the better your guess is, the more points you'll earn.</p>
