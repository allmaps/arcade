<script lang="ts">
  import { getSnapshotState } from '$lib/shared/stores/snapshot.svelte.js'

  import { formatScore } from '$lib/shared/format'

  const { snapshot, totalScore, highscoresEnabled, isNewHighscore } = getSnapshotState()
</script>

<div
  class="rounded-full max-w-fit shadow-md bg-white text-lg md:text-xl lg:text-2xl px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4"
>
  {#if $highscoresEnabled && $isNewHighscore}
    <span>New highscore</span>
  {:else}
    <span>Total score</span>
  {/if}:
  <span class="font-bold">{formatScore($snapshot.context.configuration, $totalScore)} points</span>
</div>
