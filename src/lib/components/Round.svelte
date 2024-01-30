<script lang="ts">
  import { onMount } from 'svelte'
  import { fade } from 'svelte/transition'

  import Footer from '$lib/components/Footer.svelte'
  import Button from '$lib/components/Button.svelte'
  import RoundLoading from '$lib/components/RoundLoading.svelte'
  import Image from '$lib/components/Image.svelte'
  import Map from '$lib/components/Map.svelte'
  import Zoom from '$lib/components/Zoom.svelte'
  import NorthArrow from '$lib/components/NorthArrow.svelte'
  import EyeIcon from '$lib/components/EyeIcon.svelte'
  import ScoreLarge from '$lib/components/ScoreLarge.svelte'

  import { gameService, currentRound, isLastRound, olTarget } from '$lib/shared/machines/game.js'
  import { endTime } from '$lib/shared/stores/timer.js'
  import { environment } from '$lib/shared/stores/environment.js'
  import { resetLastInteraction } from '$lib/shared/stores/game-timeout.js'

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

  // When SUBMIT event is received, submitted is set to true
  // Using $gameService.matches('round.display.submitted') caused
  // strange race-condition bugs with svelte/transition
  let submitted = false

  let found = false
  let animationFinished = false
  let showScore = true

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
      submitted = true
      found = state.event.submission.found
    } else if (state.event.type === 'FINISHED') {
      animationFinished = true
    } else if (state.event.type === 'MAP_MOVED') {
      if (animationFinished) {
        showScore = false
      }
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
          <div class="w-full grid grid-cols-[1fr_max-content_1fr] place-items-end gap-2">
            <div class="grid grid-flow-col gap-2 self-center">
              <Zoom />
            </div>
            <div>
              <Button
                timeout={AUTO_ADVANCE_MS}
                verb="show map"
                button={$environment.getButton('submit')}
                on:click={() => gameService.send('START')}>Show map</Button
              >
            </div>
            <div class="place-self-end">
              <NorthArrow />
            </div>
          </div>
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
      {#if $currentRound?.submitted && showScore}
        <div
          class="absolute w-full h-full top-0 left-0 flex justify-center items-center pointer-events-none"
        >
          <div transition:fade={{ duration: 200 }}>
            <ScoreLarge round={$currentRound} {found} />
          </div>
        </div>
      {/if}
      <Footer>
        <div class="w-full grid grid-cols-[1fr_max-content_1fr] place-items-end gap-2">
          <div class="grid grid-flow-col gap-2 self-center">
            <Button
              button={$environment.getButton('toggle')}
              verb="show submission"
              on:mousedown={handleToggleSubmissionStart}
              on:mouseup={handleToggleSubmissionEnd}><EyeIcon /></Button
            >
            <Zoom />
          </div>
          <div>
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
          <div class="place-self-end">
            <NorthArrow />
          </div>
        </div>
      </Footer>
    {:else}
      <Footer>
        <div class="w-full grid grid-cols-[1fr_max-content_1fr] place-items-end gap-2">
          <div class="grid grid-flow-col gap-2 self-center">
            <Button
              button={$environment.getButton('toggle')}
              verb="toggle image"
              on:mousedown={handleToggleImageStart}
              on:mouseup={handleToggleImageEnd}><EyeIcon /></Button
            >
            <Zoom />
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
