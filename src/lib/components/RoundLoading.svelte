<script lang="ts">
  import { getSnapshotState } from '$lib/shared/stores/snapshot.svelte.js'

  import { ATTRIBUTION_MIN_MS, MIN_LOADING_MS } from '$lib/shared/constants.js'

  import Attribution from '$lib/components/Attribution.svelte'

  type Props = {
    annotationLoading: boolean
    imageLoading: boolean
    onready: () => void
  }

  let { annotationLoading, imageLoading, onready }: Props = $props()

  const { currentRound, currentRoundIndex, currentRoundNumber } = getSnapshotState()

  let loadingPercentage = $state(0)
  let loadingText = $state('Loading map')

  let minLoadingReady = $state(false)

  const showAttribution = $derived($currentRoundIndex === 0)
  let attributionReady = $state(false)

  const firstStepPercentage = Math.random() * 10 + 10
  const firstStapAfterMs = Math.random() * 500 + 500
  const secondStepPercentage = Math.random() * 20 + 30

  setTimeout(() => (minLoadingReady = true), MIN_LOADING_MS)
  setTimeout(() => (attributionReady = true), ATTRIBUTION_MIN_MS)

  setTimeout(
    () => (loadingPercentage = Math.max(firstStepPercentage, loadingPercentage)),
    firstStapAfterMs
  )

  $effect(() => {
    if (!annotationLoading) {
      loadingText = 'Loading image'
      loadingPercentage = Math.max(secondStepPercentage, loadingPercentage)
    }

    if (
      !annotationLoading &&
      !imageLoading &&
      minLoadingReady &&
      (!showAttribution || attributionReady)
    ) {
      loadingPercentage = 100
      setTimeout(() => onready(), 150)
    }
  })
</script>

<div class="w-full h-full flex flex-col items-center justify-center gap-4">
  <div
    class="flex flex-row font-bold items-center justify-center min-h-16 pl-2 pr-6 py-2 gap-4 rounded-full bg-white p-2"
  >
    <h2
      class="text-xl rounded-full h-full px-4 {$currentRound?.colors
        .bgClass} text-white rounded-full px-4 flex items-center justify-center text-xl"
    >
      Round {$currentRoundNumber}
    </h2>

    <h3>Get ready!</h3>
  </div>

  <div
    class="bg-white/20 rounded-full w-48 p-1 relative overflow-hidden flex items-center justify-center"
  >
    <div
      class="absolute left-0 h-full transition-all bg-white/35"
      style:width={`${loadingPercentage}%`}
    ></div>
    <div class="relative text-sm font-semibold text-white opacity-80">{loadingText}…</div>
  </div>
</div>

{#if showAttribution}
  <div class="absolute bottom-0 right-0 p-2 text-black/75 text-xs lg:text-sm">
    <Attribution />
  </div>
{/if}

<style scoped>
</style>
