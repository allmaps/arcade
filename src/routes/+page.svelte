<script lang="ts">
  import { onMount, onDestroy } from 'svelte'
  import { browser } from '$app/environment'

  import Header from '$lib/components/Header.svelte'
  import Footer from '$lib/components/Footer.svelte'
  import Start from '$lib/components/Start.svelte'
  import GameIntro from '$lib/components/GameIntro.svelte'
  import Round from '$lib/components/Round.svelte'

  import { gameService, currentRoundNumber, olTarget } from '$lib/shared/stores/game.js'

  import 'ol/ol.css'

  function handleKeypress(event: KeyboardEvent) {
    if (event.key === 'z' && !event.repeat) {
      if (!$gameService.matches('round')) {
        gameService.send('NEXT')
      }
    } else if (event.key === 'x') {
      // Zoom in!
      $olTarget?.dispatchEvent(
        new KeyboardEvent('keypress', {
          key: '-'
        })
      )
    } else if (event.key === 'c') {
      // Zoom out!
      $olTarget?.dispatchEvent(
        new KeyboardEvent('keypress', {
          key: '+'
        })
      )
    } else if (event.key === 'v' && !event.repeat) {
      gameService.send('SUBMIT')
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'z' && !event.repeat) {
      if ($gameService.matches('round')) {
        gameService.send('SHOW_IMAGE')
      }
    }
  }

  function handleKeyup(event: KeyboardEvent) {
    if (event.key === 'z' && !event.repeat) {
      if ($gameService.matches('round')) {
        gameService.send('SHOW_MAP')
      }
    }
  }

  onMount(() => {
    document.addEventListener('keypress', handleKeypress)
    document.addEventListener('keyup', handleKeyup)
    document.addEventListener('keydown', handleKeydown)
  })

  onDestroy(() => {
    if (browser) {
      document.removeEventListener('keypress', handleKeypress)
      document.removeEventListener('keyup', handleKeyup)
      document.removeEventListener('keydown', handleKeydown)
    }
  })
</script>

<Header />
<main class="absolute w-full h-full flex flex-col items-center justify-center">
  {#if $gameService.matches('start')}
    <Start />
  {:else if $gameService.matches('gameIntro')}
    <GameIntro />
  {:else if $gameService.matches('round')}
    {#key $currentRoundNumber}
      <Round />
    {/key}
  {:else if $gameService.matches('summary')}
    <div>Summary</div>
  {:else if $gameService.matches('highscores')}
    <div>Highscores</div>
  {/if}
</main>
<Footer />
