<script lang="ts">
  import { Logo } from '@allmaps/ui'

  import { gameService } from '$lib/shared/machines/game.js'

  import Diamonds from '$lib/components/Diamonds.svelte'
  import Footer from '$lib/components/Footer.svelte'
  import Button from '$lib/components/Button.svelte'
  import ArcadeButtonIcon from '$lib/components/ArcadeButtonIcon.svelte'

  import { BUTTON_1 } from '$lib/shared/constants.js'
</script>

<div class="relative contents">
  <div
    class="absolute p-4 top-0 left-0 w-full h-full pb-32 flex flex-col gap-8 justify-center items-center overflow-hidden"
  >
    <svg
      class="w-full max-w-6xl overflow-hidden"
      viewBox="-20 -20 240 62"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <path id="title-path" d="M0,100C0,44.8,44.8,0,100,0s100,44.8,100,100" stroke="black" />
      </defs>
      <text class="font-bold fill-white text-2xl">
        <textPath startOffset="50%" text-anchor="middle" href="#title-path">Allmaps Arcade</textPath
        >
      </text>
    </svg>
    <div class="w-1/2 sm:w-1/3 max-w-xs">
      <Logo />
    </div>
    <h2 class="text-white text-xl sm:text-2xl lg:text-4xl text-center font-bold max-w-3xl">
      Place historical maps where they belong on a map of the world. The quicker you are, the more
      points you'll earn.
    </h2>
  </div>

  <div class="absolute -z-10 top-0 left-0 w-full h-full overflow-hidden">
    <Diamonds />
  </div>
</div>

<Footer>
  <Button shortcutKey={BUTTON_1} on:click={() => gameService.send('NEXT')}
    >Press <ArcadeButtonIcon bgClass="bg-white" /> to start</Button
  >
</Footer>
