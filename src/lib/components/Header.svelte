<script lang="ts">
  import { gameService, currentRound, score } from '$lib/shared/machines/game.js'
  import { formatScore } from '$lib/shared/format.js'

  import Timer from '$lib/components/Timer.svelte'
  import Score from '$lib/components/Score.svelte'
</script>

<header class="absolute p-6 z-10 flex flex-row w-full justify-between pointer-events-none">
  <div>
    {#if $gameService.matches('round')}
      <div
        class="font-bold bg-white px-6 py-2 rounded-full pointer-events-auto [word-spacing:theme(spacing.1)]"
      >
        Round <span class="[letter-spacing:theme(spacing.1)]">{$currentRound?.number}/5</span>
      </div>
    {/if}
  </div>
  <div>
    {#if $gameService.matches('round')}
      {#if $currentRound?.submitted === true}
        <Score round={$currentRound} />
      {:else if $gameService.matches('round.progress.playing')}
        <Timer />
      {/if}
    {/if}
  </div>
  <div>
    {#if $gameService.matches('round')}
      <div
        class="font-bold bg-white px-6 py-2 rounded-full pointer-events-auto [word-spacing:theme(spacing.1)]"
      >
        {formatScore($score)} Points
      </div>
    {/if}
  </div>
</header>
