<script lang="ts">
  import { onMount } from 'svelte'
  import { fade } from 'svelte/transition'

  import Footer from '$lib/components/Footer.svelte'
  import Button from '$lib/components/Button.svelte'
  import Loading from '$lib/components/Loading.svelte'
  import ArcadeButtonIcon from '$lib/components/ArcadeButtonIcon.svelte'
  import Image from '$lib/components/Image.svelte'
  import Map from '$lib/components/Map.svelte'
  import NorthArrow from '$lib/components/NorthArrow.svelte'

  import {
    gameService,
    currentRound,
    isLastRound,
    olTarget,
    currentRoundNumber
  } from '$lib/shared/machines/game.js'
  import { endTime } from '$lib/shared/stores/timer.js'
  import { environment } from '$lib/shared/stores/environment.js'

  import { AUTO_ADVANCE_MS } from '$lib/shared/constants.js'

  let containerImage: HTMLElement
  let containerMap: HTMLElement

  let bgClass: string | undefined

  let image: Image
  let map: Map

  let startTime: number
  let intervalId: number

  let ready = false
  let imageReady = false

  let annotationReady = false
  $: annotationReady = !$gameService.matches('round.progress.loading')

  let submitted = false
  $: submitted = $currentRound?.submitted === true

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

    bgClass = $currentRound?.colors.bgClass
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

  function handleLoadingReady() {
    ready = true
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

  function handleToggleSubmissionStart() {
    map.flyToSubmission()
  }

  function handleToggleSubmissionEnd() {
    map.flyToWarpedMap()
  }

  onMount(() => {
    startTime = getTime()
    intervalId = setInterval(updateTimer, 1000)

    return () => stopTimer()
  })
</script>

<div class="w-full h-full flex flex-col items-center justify-center {bgClass}">
  {#if $gameService.matches('round.progress.loading') || $gameService.matches('round.progress.intro')}
    {#if $gameService.matches('round.progress.intro')}
      <div bind:this={containerImage} class="absolute w-full h-full left-0 top-0">
        <Image bind:this={image} on:ready={handleImageReady} />
      </div>
    {/if}

    {#if !ready}
      <div out:fade={{ duration: 300 }} class="absolute w-full h-full top-0 {bgClass}">
        <Loading
          annotationLoading={!annotationReady}
          imageLoading={!imageReady}
          on:ready={handleLoadingReady}
        />
      </div>
    {:else}
      <Footer>
        <Button
          timeout={AUTO_ADVANCE_MS}
          keyCode={$environment.getButton(0).keyCode}
          on:click={() => gameService.send('START')}
          >Start <ArcadeButtonIcon button={$environment.getButton(0)} /></Button
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
        <div class="w-full flex flex-row items-end [&>*]:w-1/3">
          <div>
            <Button
              keyCode={$environment.getButton(0).keyCode}
              on:mousedown={handleToggleSubmissionStart}
              on:touchstart={handleToggleSubmissionStart}
              on:mouseup={handleToggleSubmissionEnd}
              on:touchend={handleToggleSubmissionEnd}
              >Show submission <ArcadeButtonIcon button={$environment.getButton(0)} /></Button
            >
          </div>
          <div class="flex justify-center">
            {#if $isLastRound}
              <Button
                keyCode={$environment.getButton(3).keyCode}
                on:click={() => gameService.send('NEXT')}
                >Press <ArcadeButtonIcon button={$environment.getButton(3)} /> for results</Button
              >
            {:else}
              <Button
                keyCode={$environment.getButton(3).keyCode}
                on:click={() => gameService.send('NEXT')}
                >Press <ArcadeButtonIcon button={$environment.getButton(3)} /> for next round</Button
              >
            {/if}
          </div>
          <div />
        </div>
      </Footer>
    {:else}
      <Footer>
        <div class="w-full flex flex-row items-end [&>*]:w-1/3">
          <div>
            <Button
              keyCode={$environment.getButton(0).keyCode}
              on:mousedown={handleToggleImageStart}
              on:touchstart={handleToggleImageStart}
              on:mouseup={handleToggleImageEnd}
              on:touchend={handleToggleImageEnd}
              >Show image <ArcadeButtonIcon button={$environment.getButton(0)} /></Button
            >
          </div>
          <div class="flex justify-center">
            <Button keyCode={$environment.getButton(3).keyCode} on:click={handleSubmit}
              >Submit <ArcadeButtonIcon button={$environment.getButton(3)} /></Button
            >
          </div>
          <div class="flex justify-end">
            <NorthArrow />
          </div>
        </div>
      </Footer>
    {/if}
  {/if}
</div>
