<script lang="ts">
  import { crossfade } from 'svelte/transition'
  import { quintOut } from 'svelte/easing'

  import Error from '$lib/components/Error.svelte'
  import Header from '$lib/components/Header.svelte'
  import Title from '$lib/components/Title.svelte'
  import Explain from '$lib/components/Explain.svelte'
  import Round from '$lib/components/Round.svelte'
  import Results from '$lib/components/Results.svelte'
  import Timeout from '$lib/components/Timeout.svelte'

  import { gameService, currentRoundNumber, olTarget } from '$lib/shared/machines/game.js'

  import { environment } from '$lib/shared/stores/environment.js'
  import { resetLastInteraction, showGameTimeoutWarning } from '$lib/shared/stores/game-timeout.js'
  import { isCabinet } from '$lib/shared/cabinet.js'
  import { GAME_TIMEOUT_WARNING_MS } from '$lib/shared/constants.js'
  import { zoomIn, zoomOut } from '$lib/shared/openlayers.js'

  import 'ol/ol.css'

  const key = 'page-crossfade'

  const [send, receive] = crossfade({
    duration: 750,
    easing: quintOut
  })

  function handleKeydown(event: KeyboardEvent) {
    if (event.code === $environment.getButton('zoomIn').keyCode) {
      // Zoom in!
      zoomIn($olTarget)
    } else if (event.code === $environment.getButton('zoomOut').keyCode) {
      // Zoom out!
      zoomOut($olTarget)
    }
  }

  gameService.onTransition(() => {
    resetLastInteraction()
  })
</script>

<svelte:document on:keydown={handleKeydown} />

<Header />
<main
  class="absolute w-full h-full flex flex-col items-center justify-center"
  class:cursor-none={isCabinet}
>
  {#if $gameService.matches('error')}
    <Error />
  {:else if $gameService.matches('loading') || $gameService.matches('title')}
    <div
      in:send={{ key }}
      out:receive={{ key }}
      class="absolute w-full h-full flex flex-col items-center justify-center"
    >
      <Title />
    </div>
  {:else if $gameService.matches('explain')}
    <div
      in:send={{ key }}
      out:receive={{ key }}
      class="absolute w-full h-full flex flex-col items-center justify-center"
    >
      <Explain />
    </div>
  {:else if $gameService.matches('round')}
    <div
      in:send={{ key }}
      out:receive={{ key }}
      class="absolute w-full h-full flex flex-col items-center justify-center"
    >
      {#key $currentRoundNumber}
        <Round />
      {/key}
    </div>
  {:else if $gameService.matches('results')}
    <div
      in:send={{ key }}
      out:receive={{ key }}
      class="absolute w-full h-full flex flex-col items-center justify-center"
    >
      <Results />
    </div>
  {/if}

  {#if $showGameTimeoutWarning}
    <div class="absolute top-0 w-full h-full">
      <Timeout timeout={GAME_TIMEOUT_WARNING_MS} />
    </div>
  {/if}
</main>
