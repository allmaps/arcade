<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  import { currentRound, currentRoundIndex, currentRoundNumber } from '$lib/shared/machines/game.js'
  import { ATTRIBUTION_MIN_MS, MIN_LOADING_MS } from '$lib/shared/constants.js'

  import Attribution from '$lib/components/Attribution.svelte'

  export let annotationLoading: boolean
  export let imageLoading: boolean

  let minLoadingReady = false

  const showAttribution = $currentRoundIndex === 0
  let attributionReady = false

  const dispatch = createEventDispatcher()

  setTimeout(() => (minLoadingReady = true), MIN_LOADING_MS)
  setTimeout(() => (attributionReady = true), ATTRIBUTION_MIN_MS)

  $: {
    if (
      !annotationLoading &&
      !imageLoading &&
      minLoadingReady &&
      (!showAttribution || attributionReady)
    ) {
      dispatch('ready')
    }
  }
</script>

<div
  class="w-full h-full flex flex-col items-center justify-center gap-4 {$currentRound?.colors
    .textColor}"
>
  <h1 class="text-xl font-bold">Round {$currentRoundNumber}</h1>

  <h2>Get ready!</h2>

  <!-- {#if $currentRound && $currentRound.loaded}
    <div>{$currentRound.area}, {formatScore($configuration, $currentRound.maxScore)}</div>
  {/if} -->
</div>

{#if showAttribution}
  <div class="absolute bottom-0 right-0 p-2 text-black/75 text-xs lg:text-sm">
    <Attribution />
  </div>
{/if}
