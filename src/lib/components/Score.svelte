<script lang="ts">
  import { formatScore } from '$lib/shared/format.js'

  import Time from '$lib/components/Time.svelte'

  import type { SubmittedRound } from '$lib/shared/types.js'

  export let round: SubmittedRound
  export let border = true
</script>

<div class={border ? '' : 'p-2'}>
  <div
    style="--color: {round.colors.color}"
    class="score font-bold bg-white pl-2 pr-6 py-2 rounded-full pointer-events-auto {border
      ? 'border-8'
      : ''} flex gap-4"
  >
    <div
      class="round-number rounded-full w-12 h-12 text-white aspect-square flex items-center justify-center text-xl"
    >
      {round.number}
    </div>
    <div>
      <div class="text-xl">
        {formatScore(round.score)}
        <span class="text-base opacity-25">/ {formatScore(round.maxScore)}</span>
      </div>
      <div class="text-sm">
        <Time milliseconds={round.endTime - round.startTime} />
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
