<script lang="ts">
  import { gameService, currentRoundNumber, score } from '$lib/shared/stores/game.js'

  import Timer from '$lib/components/Timer.svelte'
</script>

<header class="absolute p-6 z-10 flex flex-row w-full justify-between pointer-events-none">
  <div>
    {#if $gameService.matches('round')}
      <div class="font-bold bg-white px-6 py-2 rounded-full pointer-events-auto">
        Round {$currentRoundNumber} / 5
      </div>
    {/if}
  </div>
  <div>
    {#if $gameService.matches('round.play.showIntro.playing')}
      <div class="font-bold bg-white px-6 py-2 rounded-full pointer-events-auto">
        <Timer />
      </div>
    {/if}
  </div>
  <div>
    {#if $gameService.matches('round')}
      <div class="font-bold bg-white px-6 py-2 rounded-full pointer-events-auto">
        {$score} Points
      </div>
    {/if}
  </div>
</header>
