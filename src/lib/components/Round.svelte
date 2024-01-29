<script lang="ts">
  import { onMount } from 'svelte'
  import { fade } from 'svelte/transition'

  import Footer from '$lib/components/Footer.svelte'
  import Button from '$lib/components/Button.svelte'
  import RoundLoading from '$lib/components/RoundLoading.svelte'
  import Image from '$lib/components/Image.svelte'
  import Map from '$lib/components/Map.svelte'
  import NorthArrow from '$lib/components/NorthArrow.svelte'

  import { gameService, currentRound, isLastRound, olTarget } from '$lib/shared/machines/game.js'
  import { endTime } from '$lib/shared/stores/timer.js'
  import { environment } from '$lib/shared/stores/environment.js'
  import { resetLastInteraction } from '$lib/shared/stores/game-timeout.js'
  import { zoomIn, zoomOut } from '$lib/shared/openlayers.js'

  import { AUTO_ADVANCE_MS } from '$lib/shared/constants.js'

  import zoomInImage from '$lib/images/plus.svg'
  import zoomOutImage from '$lib/images/minus.svg'

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
    container.classList.remove('fade-to-invisible')
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

  function handleTransition(state: typeof gameService.state) {
    if (state.event.type === 'START') {
      gameService.send('SHOW_MAP')
    } else if (state.event.type === 'SUBMIT') {
      stopTimer()
    } else if (state.event.type === 'NEXT') {
      gameService.send('SHOW_IMAGE')
    }

    bgClass = $currentRound?.colors.bgClass
  }

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

  function handleZoomIn() {
    zoomIn($olTarget)
  }

  function handleZoomOut() {
    zoomOut($olTarget)
  }

  function stopTimer() {
    clearInterval(intervalId)
  }

  function handleToggleImageStart() {
    gameService.send('SHOW_IMAGE')
  }

  function handleToggleImageEnd() {
    gameService.send('SHOW_MAP')
  }

  function handleToggleSubmissionStart() {
    resetLastInteraction()
    map.flyToSubmission()
  }

  function handleToggleSubmissionEnd() {
    resetLastInteraction()
    map.flyToWarpedMap()
  }

  onMount(() => {
    startTime = getTime()
    intervalId = setInterval(updateTimer, 1000)

    gameService.onTransition(handleTransition)

    return () => {
      stopTimer()
      gameService.off(handleTransition)
    }
  })
</script>

<div class="w-full h-full flex flex-col items-center justify-center {bgClass}">
  {#if $gameService.matches('round.progress.loading') || $gameService.matches('round.progress.intro')}
    <div class="w-full h-full">
      {#if $gameService.matches('round.progress.intro')}
        <div bind:this={containerImage} class="absolute w-full h-full left-0 top-0">
          <Image bind:this={image} on:ready={handleImageReady} />
        </div>
      {/if}

      {#if !ready}
        <div out:fade={{ duration: 300 }} class="absolute w-full h-full top-0 {bgClass}">
          <RoundLoading
            annotationLoading={!annotationReady}
            imageLoading={!imageReady}
            on:ready={handleLoadingReady}
          />
        </div>
      {:else}
        <Footer>
          <Button
            timeout={AUTO_ADVANCE_MS}
            verb="show map"
            button={$environment.getButton('submit')}
            on:click={() => gameService.send('START')}>Show map</Button
          >
        </Footer>
      {/if}
    </div>
  {:else}
    <div class="w-full h-full">
      <div
        bind:this={containerImage}
        class="absolute w-full h-full left-0 top-0"
        class:fade-to-visible={displayImage}
        class:fade-to-invisible={!displayImage}
      >
        <Image bind:this={image} />
      </div>
      <div
        bind:this={containerMap}
        class="absolute w-full h-full left-0 top-0"
        class:fade-to-visible={displayMap}
        class:fade-to-invisible={!displayMap}
      >
        <Map bind:this={map} />
      </div>
    </div>
    {#if submitted}
      <Footer>
        <div class="w-full flex flex-row items-end [&>*]:w-1/3">
          <div>
            <Button
              button={$environment.getButton('toggle')}
              verb="show submission"
              on:mousedown={handleToggleSubmissionStart}
              on:touchstart={handleToggleSubmissionStart}
              on:mouseup={handleToggleSubmissionEnd}
              on:touchend={handleToggleSubmissionEnd}>Show submission</Button
            >
          </div>
          <div class="flex justify-center">
            {#if $isLastRound}
              <Button
                button={$environment.getButton('submit')}
                verb="show results"
                on:click={() => gameService.send('NEXT')}>Show results</Button
              >
            {:else}
              <Button
                button={$environment.getButton('submit')}
                verb="go to next round"
                on:click={() => gameService.send('NEXT')}>Next round</Button
              >
            {/if}
          </div>
          <div />
        </div>
      </Footer>
    {:else}
      <Footer>
        <div class="w-full grid grid-cols-[1fr_max-content_1fr] place-items-end gap-2">
          <div class="w-full grid grid-flow-col">
            <Button
              button={$environment.getButton('toggle')}
              verb="toggle image"
              on:mousedown={handleToggleImageStart}
              on:touchstart={handleToggleImageStart}
              on:mouseup={handleToggleImageEnd}
              on:touchend={handleToggleImageEnd}>Toggle image</Button
            >
            <Button
              button={$environment.getButton('zoomOut')}
              verb="zoom out"
              on:click={handleZoomOut}>-</Button
            >
            <Button button={$environment.getButton('zoomIn')} verb="zoom in" on:click={handleZoomIn}
              ><img class="w-4" src={zoomInImage} alt="Zoom in" /></Button
            >
          </div>
          <div>
            <Button button={$environment.getButton('submit')} verb="submit" on:click={handleSubmit}
              >Submit</Button
            >
          </div>
          <div class="place-self-end">
            <NorthArrow />
          </div>
        </div>
      </Footer>
    {/if}
  {/if}
</div>
