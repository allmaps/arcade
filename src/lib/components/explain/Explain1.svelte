<script lang="ts">
  import { environment } from '$lib/shared/stores/environment.js'

  import { isTouchDevice } from '$lib/shared/stores/touch.js'
  import { isCabinet } from '$lib/shared/cabinet.js'

  import ArcadeButtonIcon from '$lib/components/ArcadeButtonIcon.svelte'
</script>

Look at the historic map for clues about the location it depicts.

<strong
  >{#if isCabinet}
    You can always view the image again by pressing <ArcadeButtonIcon
      button={$environment.getButton('toggle')}
    />.
  {:else if $isTouchDevice}
    You can view the image again by clicking the button with the two arrows.
  {:else}
    You can view the image again by clicking the white button with the two arrows or by pressing <ArcadeButtonIcon
      button={$environment.getButton('toggle')}
    />.
  {/if}</strong
>
