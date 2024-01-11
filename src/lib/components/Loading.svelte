<script lang="ts">
  import { createEventDispatcher } from 'svelte'

  import { currentRoundNumber } from '$lib/shared/machines/game.js'
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

<h1 class="text-xl font-bold">Round {$currentRoundNumber}</h1>

<!-- TODO: Show max points, show area -->
<!-- TODO: animate mask! -->
<!-- TODO: gap between lines -->
<!-- TODO: make text also readable on dark background -->

<h2>Get ready!</h2>
