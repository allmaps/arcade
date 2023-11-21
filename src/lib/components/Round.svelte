<script lang="ts">
  import { onMount } from 'svelte'

  import { Loading } from '@allmaps/ui'

  import Footer from '$lib/components/Footer.svelte'
  import Button from '$lib/components/Button.svelte'
  import ArcadeButtonIcon from '$lib/components/ArcadeButtonIcon.svelte'
  import Image from '$lib/components/Image.svelte'
  import Map from '$lib/components/Map.svelte'
  import NorthArrow from '$lib/components/NorthArrow.svelte'

  import {
    gameService,
    currentRoundNumber,
    isLastRound,
    olTarget
  } from '$lib/shared/machines/game.js'
  import { endTime } from '$lib/shared/stores/timer.js'

  import { BUTTON_1, BUTTON_4, AUTO_ADVANCE } from '$lib/shared/constants.js'

  let containerImage: HTMLElement
  let containerMap: HTMLElement

  let image: Image
  let map: Map

  let startTime: number
  let intervalId: number

  let imageReady = false

  let submitted = false
  $: submitted = $gameService.matches('round.progress.submitted')

  function focusOlContainer(container: HTMLElement) {
    if (!container) {
      return
    }

    // This is a hack to ensure sure $olTarget's container
    // is visible before focusing
    container.classList.remove('invisible')
    $olTarget?.focus()
  }

  let displayImage: boolean
  let displayMap: boolean

  $: displayImage = $gameService.matches('round.display.image')
  $: displayMap = $gameService.matches('round.display.map')

  $: {
    if (displayImage) {
      focusOlContainer(containerImage)
    } else if (displayMap) {
      focusOlContainer(containerMap)
    }
  }

  gameService.onTransition((state) => {
    if (state.event.type === 'START') {
      gameService.send('SHOW_MAP')
    } else if (state.event.type === 'SUBMIT') {
      stopTimer()
    } else if (state.event.type === 'NEXT') {
      gameService.send('SHOW_IMAGE')
    }
  })

  function getTime() {
    const date = new Date()
    return date.getTime()
  }

  function updateTimer() {
    $endTime = getTime()
  }

  function handleImageReady() {
    imageReady = true
  }

  function handleSubmit() {
    gameService.send({
      type: 'SUBMIT',
      endTime: $endTime,
      submission: map.getSubmission()
    })
  }

  function stopTimer() {
    // $endTime = 0
    clearInterval(intervalId)
  }

  function handleToggleImageStart() {
    gameService.send('SHOW_IMAGE')
  }

  function handleToggleImageEnd() {
    gameService.send('SHOW_MAP')
  }

  onMount(() => {
    startTime = getTime()
    intervalId = setInterval(updateTimer, 1000)

    return () => stopTimer()
  })
</script>

{#if $gameService.matches('round.progress.loading')}
  <div>Round {$currentRoundNumber} - get ready!</div>
  <Loading />
{:else if $gameService.matches('round')}
  {#if $gameService.matches('round.progress.intro')}
    <div bind:this={containerImage} class="absolute w-full h-full left-0 top-0">
      <Image bind:this={image} on:ready={handleImageReady} />
    </div>

    {#if imageReady}
      <Footer>
        <Button
          timeout={AUTO_ADVANCE}
          shortcutKey={BUTTON_1}
          on:click={() => gameService.send('START')}
          >Press <ArcadeButtonIcon bgClass="bg-white" /> to start</Button
        >
      </Footer>
    {:else}
      <Footer>
        <Button shortcutKey={BUTTON_1} on:click={() => gameService.send('NEXT')}
          >Press <ArcadeButtonIcon bgClass="bg-white" /> to start</Button
        >
      </Footer>
    {/if}
  {:else}
    <div
      bind:this={containerImage}
      class="absolute w-full h-full left-0 top-0"
      class:invisible={!displayImage}
    >
      <Image bind:this={image} />
    </div>
    <div
      bind:this={containerMap}
      class="absolute w-full h-full left-0 top-0"
      class:invisible={!displayMap}
    >
      <Map bind:this={map} />
    </div>

    {#if submitted}
      <Footer>
        {#if $isLastRound}
          <Button shortcutKey={BUTTON_1} on:click={() => gameService.send('NEXT')}
            >Press <ArcadeButtonIcon bgClass="bg-black" /> for results</Button
          >
        {:else}
          <Button shortcutKey={BUTTON_1} on:click={() => gameService.send('NEXT')}
            >Press <ArcadeButtonIcon bgClass="bg-black" /> for next round</Button
          >
        {/if}
      </Footer>
    {:else}
      <Footer>
        <div class="w-full flex flex-row items-end [&>*]:w-1/3">
          <div>
            <Button
              shortcutKey={BUTTON_1}
              on:mousedown={handleToggleImageStart}
              on:touchstart={handleToggleImageStart}
              on:mouseup={handleToggleImageEnd}
              on:touchend={handleToggleImageEnd}
              >Toggle <ArcadeButtonIcon bgClass="bg-white" /></Button
            >
          </div>
          <div class="flex justify-center">
            <Button shortcutKey={BUTTON_4} on:click={handleSubmit}
              >Press <ArcadeButtonIcon bgClass="bg-black" /> to submit</Button
            >
          </div>
          <div class="flex justify-end">
            <NorthArrow />
          </div>
        </div>
      </Footer>
    {/if}
  {/if}
{/if}
