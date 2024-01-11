<script lang="ts">
  import { onMount } from 'svelte'

  import Error from '$lib/components/Error.svelte'
  import Header from '$lib/components/Header.svelte'
  import Title from '$lib/components/Title.svelte'
  import Explain from '$lib/components/Explain.svelte'
  import Round from '$lib/components/Round.svelte'
  import Results from '$lib/components/Results.svelte'

  import { gameService, currentRoundNumber, olTarget } from '$lib/shared/machines/game.js'

  import { environment } from '$lib/shared/stores/environment.js'
  import { resetLastInteraction } from '$lib/shared/stores/game-timeout.js'
  import { isCabinet } from '$lib/shared/cabinet.js'

  import 'ol/ol.css'

  function handleKeydown(event: KeyboardEvent) {
    if (event.code === $environment.getButton(1).keyCode) {
      // Zoom out!
      $olTarget?.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: '-'
        })
      )
    } else if (event.code === $environment.getButton(2).keyCode) {
      // Zoom in!
      $olTarget?.dispatchEvent(
        new KeyboardEvent('keydown', {
          key: '+'
        })
      )
    }
  }

  gameService.onTransition(() => {
    resetLastInteraction()
  })

  onMount(() => {
    document.addEventListener('keydown', handleKeydown)

    return () => {
      document.removeEventListener('keydown', handleKeydown)
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
  {:else if $gameService.matches('title')}
    <Title />
  {:else if $gameService.matches('explain')}
    <Explain />
  {:else if $gameService.matches('round')}
    {#key $currentRoundNumber}
      <Round />
    {/key}
  {:else if $gameService.matches('results')}
    <Results />
  {/if}
</main>
