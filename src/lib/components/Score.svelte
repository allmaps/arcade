<script lang="ts">
  import { formatScore } from '$lib/shared/format.js'
  import { configuration } from '$lib/shared/machines/game'

  import Time from '$lib/components/Time.svelte'

  import type { SubmittedRound } from '$lib/shared/types.js'

  export let round: SubmittedRound
  export let border = true
</script>

<div>
  <div
    style="--color: {round.colors.color}"
    class="score shadow-md transition-all font-bold bg-white pl-2 pr-6 py-2 rounded-full pointer-events-auto {border
      ? 'outline-8'
      : 'outline-0'} outline flex gap-4"
  >
    <div
      class="{round.colors.bgClass} {round.colors
        .textColor} rounded-full w-12 h-12 text-white aspect-square flex items-center justify-center text-xl"
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
    </div>
  </div>
</div>

<style scoped>
  .score {
    outline-color: var(--color);
    /* outline: solid 5px #fc5185; */
    /* transition: outline 0.6s linear; */
    /* margin: 0.5em; */
  }
</style>
