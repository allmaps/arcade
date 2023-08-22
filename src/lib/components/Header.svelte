<script lang="ts">
  import { gameService, currentRoundNumber, score } from '$lib/shared/stores/game.js'
</script>

<header class="absolute p-6 z-10 flex flex-row w-full justify-between pointer-events-none">
  <div>
    {#if $gameService.matches('round')}
      <div class="font-bold bg-white px-6 py-2 rounded-full pointer-events-auto">
        {$currentRoundNumber} / 5
      </div>
    {/if}
  </div>
  <div>
    <!-- Countdown -->
  </div>
  <div>
    {#if $gameService.matches('round')}
      <div class="font-bold bg-white px-6 py-2 rounded-full pointer-events-auto">
        {$score} Points
      </div>
    {/if}
  </div>
</header>
