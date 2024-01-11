<script lang="ts">
  import { Logo } from '@allmaps/ui'

  import { gameService } from '$lib/shared/machines/game.js'
  import { environment } from '$lib/shared/stores/environment.js'

  import Diamonds from '$lib/components/Diamonds.svelte'
  import Masks from '$lib/components/Masks.svelte'
  import Footer from '$lib/components/Footer.svelte'
  import Button from '$lib/components/Button.svelte'
  import ArcadeButtonIcon from '$lib/components/ArcadeButtonIcon.svelte'
</script>

<div class="relative contents">
  <div
    class="absolute p-4 top-0 left-0 w-full h-full pb-32 flex flex-col gap-8 justify-center items-center overflow-hidden"
  >
    <h1 class="text-white text-7xl font-bold text-center">Allmaps<br /> Arcade</h1>
    <!-- <div class="w-1/2 sm:w-1/3 max-w-xs">
      <Logo />
    </div> -->
    <h2 class="text-white text-xl sm:text-2xl lg:text-4xl text-center font-bold max-w-3xl">
      Place historical maps where they belong on a map of the world. The quicker you are, the more
      points you'll earn.
    </h2>
  </div>

  <div class="absolute -z-10 top-0 left-0 w-full h-full overflow-hidden bg-yellow">
    <!-- <Masks /> -->
    <Diamonds />
  </div>
</div>

<Footer>
  <Button keyCode={$environment.getButton(0).keyCode} on:click={() => gameService.send('NEXT')}
    >Start <ArcadeButtonIcon button={$environment.getButton(0)} /></Button
  >
</Footer>
