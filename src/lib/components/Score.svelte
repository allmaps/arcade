<script lang="ts">
  import { formatScore } from '$lib/shared/format.js'
  import { getSnapshotState } from '$lib/shared/stores/snapshot.svelte.js'

  import type { SubmittedRound } from '$lib/shared/types.js'

  const { snapshot } = getSnapshotState()

  type Props = {
    round: SubmittedRound
    border?: boolean
    showPoints?: boolean
  }

  let { round, border = true, showPoints = true }: Props = $props()
</script>

<div
  style:outline-color={round.colors.color}
  class="score shadow-md transition-all font-bold bg-white p-1 md:p-2 rounded-full pointer-events-auto {border
    ? 'outline-4 md:outline-8'
    : 'outline-0'} outline flex items-center gap-0 w-full"
>
  <div
    class="{round.colors.bgClass} {round.colors
      .textColor} rounded-full w-9 h-9 text-white aspect-square flex shrink-0 items-center justify-center text-xl"
  >
    {round.number}
  </div>
  {#if showPoints}
    <div class="px-2">
      {formatScore($snapshot.context.configuration, round.score)}&nbsp;<span class="md:hidden"
        >pts</span
      ><span class="hidden md:inline">points</span>
    </div>
  {/if}
</div>
