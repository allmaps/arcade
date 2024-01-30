<script lang="ts">
  import { gameService, currentRound, score } from '$lib/shared/machines/game.js'
  import { formatScore } from '$lib/shared/format.js'

  import { NUMBER_OF_ROUNDS } from '$lib/shared/constants.js'
  import { configuration } from '$lib/shared/machines/game.js'

  import Timer from '$lib/components/Timer.svelte'
  import Score from '$lib/components/Score.svelte'
  import TotalScore from '$lib/components/TotalScore.svelte'
</script>

<header
  class="absolute p-3 md:p-4 lg:p-6 z-10 grid grid-cols-3 w-full pointer-events-none place-items-center gap-4"
>
  <div class="place-self-start">
    {#if $gameService.matches('round')}
      <div
        class="shadow-sm font-bold bg-white/50 px-6 py-2 rounded-full pointer-events-auto [word-spacing:theme(spacing.1)]"
      >
        Round <span class="[letter-spacing:theme(spacing.1)]"
          >{$currentRound?.number}/{NUMBER_OF_ROUNDS}</span
        >
      </div>
    {/if}
  </div>
  <div>
    {#if $gameService.matches('results')}
      <TotalScore />
    {:else if $gameService.matches('round')}
      {#if $currentRound?.submitted === true}
        <!-- <Score round={$currentRound} /> -->
      {:else if $gameService.matches('round.progress.playing')}
        <Timer />
      {/if}
    {/if}
  </div>
  <div class="place-self-end">
    {#if $gameService.matches('round')}
      <div
        class="shadow-sm font-bold bg-white/50 px-6 py-2 rounded-full pointer-events-auto [word-spacing:theme(spacing.1)]"
      >
        {formatScore($configuration, $score)} Points
      </div>
    {/if}
  </div>
</header>
