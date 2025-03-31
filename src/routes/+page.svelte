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
  import NewHighscore from '$lib/components/NewHighscore.svelte'
  import Highscores from '$lib/components/Highscores.svelte'

  import { getSnapshotState } from '$lib/shared/stores/snapshot.svelte.js'
  import { getDeviceState } from '$lib/shared/stores/device.svelte.js'
  import { getGameTimeoutState } from '$lib/shared/stores/game-timeout.svelte.js'

  import { isCabinet } from '$lib/shared/cabinet.js'
  import { GAME_TIMEOUT_WARNING_MS } from '$lib/shared/constants.js'
  import { zoomIn, zoomOut } from '$lib/shared/keyboard.js'

  import 'maplibre-gl/dist/maplibre-gl.css'
  import 'ol/ol.css'

  const { snapshot, send, currentRoundNumber, keyboardTarget, actorRef } = getSnapshotState()
  const deviceState = getDeviceState()
  const gameTimeoutState = getGameTimeoutState()

  const key = 'page-crossfade'

  const [crossfadeSend, crossfadeReceive] = crossfade({
    duration: 750,
    easing: quintOut
  })

  function handleKeydown(event: KeyboardEvent) {
    if (event.code === $snapshot.context.environment.getButton('zoomIn').keyCode) {
      // Zoom in!
      zoomIn($keyboardTarget)
    } else if (event.code === $snapshot.context.environment.getButton('zoomOut').keyCode) {
      // Zoom out!
      zoomOut($keyboardTarget)
    }
  }

  function handleTransition() {
    gameTimeoutState.resetLastInteraction()
  }

  function handleFirstTouch() {
    deviceState.isTouch = true
    window.removeEventListener('touchstart', handleFirstTouch, false)
  }

  onMount(() => {
    const subscription = actorRef.subscribe(handleTransition)

    gameTimeoutState.addEventListener('timeout', () => send({ type: 'TIMEOUT' }))

    window.addEventListener('touchstart', handleFirstTouch, false)

    return () => {
      // TODO: cancel event listeners!
      subscription.unsubscribe()
    }
  })
</script>

<svelte:document onkeydown={handleKeydown} />
<Stats statsWebsiteId={import.meta.env.ARCADE_STATS_WEBSITE_ID} />

<div class="w-full h-full" class:cursor-none={isCabinet}>
  {#if $snapshot.matches('error')}
    <Error />
  {:else if $snapshot.matches('loading') || $snapshot.matches('title')}
    <div
      in:crossfadeSend={{ key }}
      out:crossfadeReceive={{ key }}
      class="absolute w-full h-full flex flex-col items-center justify-center"
    >
      <Title />
    </div>
  {:else if $snapshot.matches('explain')}
    <div
      in:crossfadeSend={{ key }}
      out:crossfadeReceive={{ key }}
      class="absolute w-full h-full flex flex-col items-center justify-center"
    >
      <Explain />
    </div>
  {:else if $snapshot.matches('round')}
    <div class="absolute w-full h-full flex flex-col items-center justify-center">
      {#key currentRoundNumber}
        <Round />
      {/key}
    </div>
  {:else if $snapshot.matches('results')}
    <div
      in:crossfadeSend={{ key }}
      out:crossfadeReceive={{ key }}
      class="absolute w-full h-full flex flex-col items-center justify-center"
    >
      <Results />
    </div>
  {:else if $snapshot.matches('highscores.new')}
    <div
      in:crossfadeSend={{ key }}
      out:crossfadeReceive={{ key }}
      class="absolute w-full h-full flex flex-col items-center justify-center"
    >
      <NewHighscore />
    </div>
  {:else if $snapshot.matches('highscores.show')}
    <div
      in:crossfadeSend={{ key }}
      out:crossfadeReceive={{ key }}
      class="absolute w-full h-full flex flex-col items-center justify-center"
    >
      <Highscores />
    </div>
  {/if}

  {#if gameTimeoutState.showGameTimeoutWarning}
    <div class="absolute top-0 w-full h-full pointer-events-none">
      <Timeout timeout={GAME_TIMEOUT_WARNING_MS} />
    </div>
  {/if}
</div>
