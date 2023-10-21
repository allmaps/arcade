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

  import { BUTTON_1, BUTTON_2, BUTTON_3 } from '$lib/shared/constants.js'

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

    // if (event.key === 'z' && !event.repeat) {
    //   if (!$gameService.matches('round')) {
    //     gameService.send('NEXT')
    //   }
    // } else if (event.key === 'x') {
    //   // Zoom in!
    //   $olTarget?.dispatchEvent(
    //     new KeyboardEvent('keypress', {
    //       key: '-'
    //     })
    //   )
    // } else if (event.key === 'c') {
    //   // Zoom out!
    //   $olTarget?.dispatchEvent(
    //     new KeyboardEvent('keypress', {
    //       key: '+'
    //     })
    //   )
    // } else if (event.key === 'v' && !event.repeat) {
    //   gameService.send('SUBMIT')
    // }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === BUTTON_1 && !event.repeat) {
      if ($gameService.matches('round.progress.playing')) {
        gameService.send('SHOW_IMAGE')
      }
    }
  }

  function handleKeyup(event: KeyboardEvent) {
    if (event.key === BUTTON_1 && !event.repeat) {
      if ($gameService.matches('round.progress.playing')) {
        gameService.send('SHOW_MAP')
      }
    }
  }

  onMount(() => {
    document.addEventListener('keypress', handleKeypress)
    document.addEventListener('keyup', handleKeyup)
    document.addEventListener('keydown', handleKeydown)

    return () => {
      document.removeEventListener('keypress', handleKeypress)
      document.removeEventListener('keyup', handleKeyup)
      document.removeEventListener('keydown', handleKeydown)
    }
  })
</script>

<Header />
<main class="absolute w-full h-full flex flex-col items-center justify-center">
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
