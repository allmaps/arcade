<script lang="ts">
  import { gameService, currentRound, score } from '$lib/shared/machines/game.js'
  import { formatScore } from '$lib/shared/format.js'

  import { NUMBER_OF_ROUNDS } from '$lib/shared/constants.js'
  import { configuration } from '$lib/shared/machines/game.js'

  import Timer from '$lib/components/Timer.svelte'
  import Score from '$lib/components/Score.svelte'
  import FinalScore from '$lib/components/FinalScore.svelte'
</script>

<header
  class="absolute p-3 md:p-4 lg:p-6 z-10 grid grid-cols-3 w-full pointer-events-none place-items-center gap-4"
>
  <div class="justify-self-start">
    {#if $gameService.matches('round')}
      <div
        class="shadow-sm font-bold bg-white px-3 py-1 sm:px-6 sm:py-2 rounded-full pointer-events-auto [word-spacing:theme(spacing.1)]"
      >
        <span class="hidden sm:inline">Round</span><span class="sm:hidden">#</span>
        <span class="[letter-spacing:theme(spacing.1)]"
          >{$currentRound?.number}/{NUMBER_OF_ROUNDS}</span
        >
      </div>
    {/if}
  </div>
  <div>
    {#if $gameService.matches('results')}
      <FinalScore />
    {:else if $gameService.matches('round')}
      {#if $currentRound?.submitted === true}
        <!-- <Score round={$currentRound} /> -->
      {:else if $gameService.matches('round.progress.playing')}
        <Timer />
      {/if}
    {/if}
  </div>
  <div class="justify-self-end">
    {#if $gameService.matches('round')}
      <div
        class="shadow-sm font-bold bg-white px-3 py-1 sm:px-6 sm:py-2 rounded-full pointer-events-auto [word-spacing:theme(spacing.1)]"
      >
        {formatScore($configuration, $score)} Points
      </div>
    {/if}
  </div>
</header>
