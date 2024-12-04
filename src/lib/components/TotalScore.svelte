<script lang="ts">
  import { isNewHighscore, totalScore, configuration } from '$lib/shared/machines/game.js'

  import { formatScore } from '$lib/shared/format'
</script>

<div
  class="rounded-full max-w-fit shadow-md bg-white text-lg md:text-xl lg:text-2xl px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4"
>
  {#if $isNewHighscore}
    <span>New highscore</span>
  {:else}
    <span>Total score</span>
  {/if}: <span class="font-bold">{formatScore($configuration, $totalScore)} points</span>
</div>
