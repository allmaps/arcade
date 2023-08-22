<script lang="ts">
  import { onMount, onDestroy } from 'svelte'

  import { Loading } from '@allmaps/ui'

  import Image from '$lib/components/Image.svelte'
  import Map from '$lib/components/Map.svelte'

  import { gameService, currentRoundNumber, olTarget } from '$lib/shared/stores/game.js'

  let containerImage: HTMLElement
  let containerMap: HTMLElement

  let image: Image
  let map: Map

  let startTime: number
  let intervalId: number

  function focusOlContainer(container: HTMLElement) {
    if (!container) {
      return
    }

    // This is a hack to ensure sure $olTarget's container
    // is visible before focusing
    container.classList.remove('invisible')
    $olTarget?.focus()
  }

  $: {
    if ($gameService.matches('round.play.display.image')) {
      focusOlContainer(containerImage)
    } else if ($gameService.matches('round.play.display.map')) {
      focusOlContainer(containerMap)
    }
  }

  function getTime() {
    const date = new Date()
    return date.getTime()
  }

  function updateStopwatch() {
    const time = getTime()

    const diffTime = time - startTime
    // const d = new Date()
    // let time = d.getTime()

    // const duration = {
    //   hours: 1,
    //   minutes: 46,
    //   seconds: 40
    // }

    // "1:46:40"
  }

  onMount(() => {
    startTime = getTime()

    intervalId = setInterval(updateStopwatch, 1000)
  })

  onDestroy(() => {
    clearInterval(intervalId)
  })
</script>

{#if $gameService.matches('round.loading')}
  <div>Round {$currentRoundNumber} - get ready!</div>
  <Loading />
{:else if $gameService.matches('round')}
  {#if $gameService.matches('round.play.showIntro.roundIntro')}
    <div bind:this={containerImage} class="absolute w-full h-full top-0">
      <Image bind:this={image} />
    </div>
  {:else}
    <div
      bind:this={containerImage}
      class="absolute w-full h-full top-0"
      class:invisible={!$gameService.matches('round.play.display.image')}
    >
      <Image bind:this={image} />
    </div>
    <div
      bind:this={containerMap}
      class="absolute w-full h-full top-0"
      class:invisible={!$gameService.matches('round.play.display.map')}
    >
      <Map bind:this={map} />
    </div>
  {/if}
{/if}
