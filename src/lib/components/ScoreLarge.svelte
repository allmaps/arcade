<script lang="ts">
  import { formatScore } from '$lib/shared/format.js'

  import { getSnapshotState } from '$lib/shared/stores/snapshot.svelte.js'

  import Time from '$lib/components/Time.svelte'

  import type { SubmittedRound } from '$lib/shared/types.js'

  type Props = {
    round: SubmittedRound
  }

  let { round }: Props = $props()

  const { snapshot } = getSnapshotState()

  // 1. maxScore: Perfect Score!
  // 2. found: Found!
  // 3. score > 50% maxScore: Well done!
  // 4. score > 0: Good try!
  // 5: score = 0: Try again!
</script>

<div>
  <div
    style="--color: {round.colors.color}"
    class="score shadow-md transition-all min-h-20 font-bold bg-white pl-2 pr-6 py-2 rounded-full pointer-events-auto border-8 flex gap-4"
  >
    <div
      class="{round.colors
        .bgClass} rounded-full px-4 text-white flex items-center justify-center text-xl"
    >
      Round {round.number}
    </div>
    <div>
      <div class="text-xl">
        {formatScore($snapshot.context.configuration, round.score)} Points
        <span class="text-base opacity-25"
          >/ {formatScore($snapshot.context.configuration, round.maxScore)}</span
        >
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
</style>
