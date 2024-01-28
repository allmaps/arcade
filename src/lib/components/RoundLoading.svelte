<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  import { formatScore } from '$lib/shared/format.js'
  import { configuration, currentRound, currentRoundNumber } from '$lib/shared/machines/game.js'
  import { MIN_LOADING_MS } from '$lib/shared/constants.js'

  export let annotationLoading: boolean
  export let imageLoading: boolean

  let minLoadingReady = false

  const dispatch = createEventDispatcher()

  setTimeout(() => (minLoadingReady = true), MIN_LOADING_MS)

  $: {
    if (!annotationLoading && !imageLoading && minLoadingReady) {
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
