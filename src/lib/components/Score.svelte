<script lang="ts">
  import { formatScore, formatPercentage, formatDistance } from '$lib/shared/format.js'
  import { configuration } from '$lib/shared/machines/game'

  import Time from '$lib/components/Time.svelte'

  import type { SubmittedRound } from '$lib/shared/types.js'

  export let round: SubmittedRound
  export let border = true
</script>

<div>
  <div
    style="--color: {border ? round.colors.color : 'rgba(255, 255, 255, 0)'}"
    class="score shadow-md transition-all font-bold bg-white pl-2 pr-6 py-2 rounded-full pointer-events-auto border-8 flex gap-4"
  >
    <div
      class="round-number rounded-full w-12 h-12 text-white aspect-square flex items-center justify-center text-xl"
    >
      {round.number}
    </div>
    <div>
      <div class="text-xl">
        {formatScore($configuration, round.score)}
        <span class="text-base opacity-25">/ {formatScore($configuration, round.maxScore)}</span>
      </div>
      <div class="text-sm">
        <Time milliseconds={round.endTime - round.startTime} />
      </div>
      <div class="text-sm">
        {formatPercentage(round.area / round.submission.area)}
      </div>
      <div class="text-sm">
        {formatDistance(round.submission.distance)}
      </div>
    </div>
  </div>
</div>

<style scoped>
  .score {
    border-color: var(--color);
  }

  .round-number {
    background-color: var(--color);
  }
</style>
