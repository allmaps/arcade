<script lang="ts">
  import { gameService } from '$lib/shared/machines/game.js'
  import { environment } from '$lib/shared/stores/environment.js'

  import Masks from '$lib/components/Masks.svelte'
  import Footer from '$lib/components/Footer.svelte'
  import Button from '$lib/components/Button.svelte'

  // import LoadingAnimation from '$lib/animations/allmaps-loading.lottie'
  // onMount(async () => {
  //   await import('@dotlottie/player-component')
  // })
  // <dotlottie-player src={LoadingAnimation} autoplay loop />
</script>

<div class="relative contents">
  <div
    class="absolute p-4 lg:p-8 top-0 left-0 w-full h-full flex flex-col gap-8 justify-center items-center overflow-hidden"
  >
    <h1 class="text-white text-7xl lg:text-8xl font-bold text-center drop-shadow-md leading-tight">
      Allmaps <span class="font-normal">Arcade</span>
    </h1>
    <h2
      class="text-white text-xl sm:text-2xl lg:text-4xl text-center font-bold max-w-2xl drop-shadow-sm"
    >
      Place historical maps where they belong on the map of the world. The faster you are, the more
      points you'll earn.
    </h2>
  </div>

  <div class="absolute -z-10 top-0 left-0 w-full h-full overflow-hidden">
    <Masks />
  </div>
</div>

{#if $gameService.matches('title')}
  <Footer>
    <Button
      button={$environment.getButton('submit')}
      verb="start new game"
      on:click={() => gameService.send('NEXT')}>Start new game</Button
    >
  </Footer>
{/if}
