<script lang="ts">
  import { gameService, currentRoundNumber, score } from '$lib/shared/machines/game.js'

  import Timer from '$lib/components/Timer.svelte'
</script>

<header class="absolute p-6 z-10 flex flex-row w-full justify-between pointer-events-none">
  <div>
    {#if $gameService.matches('round')}
      <div
        class="font-bold bg-white px-6 py-2 rounded-full pointer-events-auto [word-spacing:theme(spacing.2)]"
      >
        Round <span class="[letter-spacing:theme(spacing.1)]">{$currentRoundNumber}/5</span>
      </div>
    {/if}
  </div>
  <div>
    {#if $gameService.matches('round.progress.playing') || $gameService.matches('round.progress.submitted')}
      <div class="font-bold bg-white px-6 py-2 rounded-full pointer-events-auto">
        <Timer />
      </div>
    {/if}
  </div>
  <div>
    {#if $gameService.matches('round')}
      <div
        class="font-bold bg-white px-6 py-2 rounded-full pointer-events-auto [word-spacing:theme(spacing.2)]"
      >
        {$score} Points
      </div>
    {/if}
  </div>
</header>
