<script lang="ts">
  import { onMount } from 'svelte'
  import { crossfade } from 'svelte/transition'
  import { quintOut } from 'svelte/easing'

  import { Stats } from '@allmaps/ui'

  import Error from '$lib/components/Error.svelte'
  import Title from '$lib/components/Title.svelte'
  import Explain from '$lib/components/Explain.svelte'
  import Round from '$lib/components/Round.svelte'
  import Results from '$lib/components/Results.svelte'
  import Timeout from '$lib/components/Timeout.svelte'

  import { actor, state, currentRoundNumber, keyboardTarget } from '$lib/shared/machines/game.js'

  import { environment } from '$lib/shared/stores/environment.js'
  import { isTouchDevice } from '$lib/shared/stores/touch.js'
  import { resetLastInteraction, showGameTimeoutWarning } from '$lib/shared/stores/game-timeout.js'
  import { isCabinet } from '$lib/shared/cabinet.js'
  import { GAME_TIMEOUT_WARNING_MS } from '$lib/shared/constants.js'
  import { zoomIn, zoomOut } from '$lib/shared/keyboard.js'

  import 'maplibre-gl/dist/maplibre-gl.css'
  import 'ol/ol.css'

  const key = 'page-crossfade'

  const [send, receive] = crossfade({
    duration: 750,
    easing: quintOut
  })

  function handleKeydown(event: KeyboardEvent) {
    if (event.code === $environment.getButton('zoomIn').keyCode) {
      // Zoom in!
      zoomIn($keyboardTarget)
    } else if (event.code === $environment.getButton('zoomOut').keyCode) {
      // Zoom out!
      zoomOut($keyboardTarget)
    }
  }

  function handleTransition() {
    resetLastInteraction()
  }

  function handleFirstTouch() {
    isTouchDevice.set(true)
    window.removeEventListener('touchstart', handleFirstTouch, false)
  }

  onMount(() => {
    const subscription = actor.subscribe(handleTransition)

    window.addEventListener('touchstart', handleFirstTouch, false)

    return () => {
      subscription.unsubscribe()
    }
  })
</script>

<svelte:document on:keydown={handleKeydown} />
<Stats statsWebsiteId={import.meta.env.ARCADE_STATS_WEBSITE_ID} />

<div class="w-full h-full" class:cursor-none={isCabinet}>
  {#if $state.matches('error')}
    <Error />
  {:else if $state.matches('loading') || $state.matches('title')}
    <div
      in:send={{ key }}
      out:receive={{ key }}
      class="absolute w-full h-full flex flex-col items-center justify-center"
    >
      <Title />
    </div>
  {:else if $state.matches('explain')}
    <div
      in:send={{ key }}
      out:receive={{ key }}
      class="absolute w-full h-full flex flex-col items-center justify-center"
    >
      <Explain />
    </div>
  {:else if $state.matches('round')}
    <div class="absolute w-full h-full flex flex-col items-center justify-center">
      {#key $currentRoundNumber}
        <Round />
      {/key}
    </div>
  {:else if $state.matches('results')}
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
</div>
