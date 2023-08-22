<script lang="ts">
  import { gameService } from '$lib/shared/stores/game.js'
</script>

<footer class="absolute bottom-0 p-6 z-10 flex flex-row w-full justify-center pointer-events-none">
  {#if $gameService.matches('round.play.showIntro.playing')}
    <button
      type="button"
      class="text-white bg-purple font-medium rounded-full px-5 py-2.5 mr-2 mb-2 focus:outline-none pointer-events-auto"
      disabled={$gameService.matches('round.loading')}
      on:click={() => gameService.send('SUBMIT')}>Submit</button
    >
  {:else}
    <button
      type="button"
      class="text-white bg-purple font-medium rounded-full px-5 py-2.5 mr-2 mb-2 focus:outline-none pointer-events-auto"
      on:click={() => gameService.send('NEXT')}>Next</button
    >
  {/if}
</footer>
