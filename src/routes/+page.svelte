<script lang="ts">
  import { onMount } from 'svelte'

  import Error from '$lib/components/Error.svelte'
  import Header from '$lib/components/Header.svelte'
  import Start from '$lib/components/Start.svelte'
  import GameIntro from '$lib/components/GameIntro.svelte'
  import Round from '$lib/components/Round.svelte'
  import Summary from '$lib/components/Summary.svelte'
  import Highscores from '$lib/components/Highscores.svelte'

  import { gameService, currentRoundNumber, olTarget } from '$lib/shared/machines/game.js'

  import { isCabinet } from '$lib/shared/cabinet.js'
  import { BUTTON_2, BUTTON_3 } from '$lib/shared/constants.js'

  import 'ol/ol.css'

  function handleKeypress(event: KeyboardEvent) {
    if (event.key === BUTTON_2) {
      // Zoom in!
      $olTarget?.dispatchEvent(
        new KeyboardEvent('keypress', {
          key: '-'
        })
      )
    } else if (event.key === BUTTON_3) {
      // Zoom out!
      $olTarget?.dispatchEvent(
        new KeyboardEvent('keypress', {
          key: '+'
        })
      )
    }
  }

  onMount(() => {
    document.addEventListener('keypress', handleKeypress)

    return () => {
      document.removeEventListener('keypress', handleKeypress)
    }
  })
</script>

<Header />
<main
  class="absolute w-full h-full flex flex-col items-center justify-center"
  class:cursor-none={isCabinet}
>
  {#if $gameService.matches('error')}
    <Error />
  {:else if $gameService.matches('start')}
    <Start />
  {:else if $gameService.matches('gameIntro')}
    <GameIntro />
  {:else if $gameService.matches('round')}
    {#key $currentRoundNumber}
      <Round />
    {/key}
  {:else if $gameService.matches('summary')}
    <Summary />
  {:else if $gameService.matches('highscores')}
    <Highscores />
  {/if}
</main>
