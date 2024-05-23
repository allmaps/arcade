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

  import {
    actor,
    state,
    currentRound,
    isLastRound,
    keyboardTarget,
    type Snapshot
  } from '$lib/shared/machines/game.js'
  import { endTime } from '$lib/shared/stores/timer.js'
  import { environment } from '$lib/shared/stores/environment.js'
  import { resetLastInteraction } from '$lib/shared/stores/game-timeout.js'

  import type { KeyboardTarget, LoadedRound } from '$lib/shared/types.js'

  import { AUTO_ADVANCE_MS } from '$lib/shared/constants.js'

  let containerImage: HTMLElement
  let containerMap: HTMLElement

  let bgClass: string | undefined = $currentRound?.colors.bgClass

  let image: Image
  let map: Map

  let startTime: number
  let intervalId: number

  let ready = false
  let imageReady = false

  let annotationReady = false
  $: annotationReady = !$state.matches('round.progress.loading')

  // When SUBMIT event is received, submitted is set to true
  // Using $snapshot.matches('round.display.submitted') caused
  // strange race-condition bugs with svelte/transition
  let submitted = false

  let found = false

  function focusElement(element: HTMLElement, keyboardTarget: KeyboardTarget) {
    if (!element) {
      return
    }

    // This is a hack to ensure sure $olTarget's container
    // is visible before focusing
    element.classList.remove('fade-to-invisible')
    keyboardTarget.element.focus()
  }

  let displayImage: boolean
  let displayMap: boolean

  $: displayImage = $state.matches('round.display.image')
  $: displayMap = $state.matches('round.display.map')

  $: canSubmit = ($currentRound as LoadedRound)?.canSubmit || false

  $: {
    if ($keyboardTarget) {
      if (displayImage) {
        focusElement(containerImage, $keyboardTarget)
      } else if (displayMap) {
        focusElement(containerMap, $keyboardTarget)
      }
    }
  }

  function handleTransition(snapshot: Snapshot) {
    if (snapshot.matches('round.progress.submitted.animating')) {
      stopTimer()
      submitted = true
      if ($currentRound?.submitted) {
        found = $currentRound.submission?.found
      }
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
    actor.send({
      type: 'SUBMIT',
      endTime: $endTime,
      submission: map.getSubmission()
    })
  }

  function stopTimer() {
    clearInterval(intervalId)
  }

  function handleToggleImageStart() {
    actor.send({ type: 'SHOW_IMAGE' })
  }

  function handleToggleImageEnd() {
    actor.send({ type: 'SHOW_MAP' })
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

    const subscription = actor.subscribe(handleTransition)

    return () => {
      stopTimer()
      subscription.unsubscribe()
    }
  })
</script>

<div class="w-full h-full flex flex-col items-center justify-center {bgClass}">
  {#if $state.matches('round.progress.loading') || $state.matches('round.progress.intro')}
    <div class="w-full h-full">
      {#if $state.matches('round.progress.intro')}
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
          <div
            class="w-full grid grid-cols-[1fr_max-content_1fr] items-center place-items-end gap-2"
          >
            <div class="grid grid-flow-col gap-2 self-center">
              <Zoom />
            </div>
            <div>
              <Button
                timeout={AUTO_ADVANCE_MS}
                verb="show map"
                button={$environment.getButton('submit')}
                on:click={() => actor.send({ type: 'START' })}>Show map</Button
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
      {#if $currentRound?.submitted && ($state.matches('round.progress.submitted.animating') || $state.matches('round.progress.submitted.score'))}
        <div
          class="absolute w-full h-full top-0 left-0 flex justify-center items-center pointer-events-none"
        >
          <div transition:fade={{ duration: 200 }}>
            <ScoreLarge round={$currentRound} {found} />
          </div>
        </div>
      {/if}
      <Footer>
        <div class="w-full grid grid-cols-[1fr_max-content_1fr] items-center place-items-end gap-2">
          <div class="grid grid-flow-col gap-2 self-center">
            <Button
              button={$environment.getButton('toggle')}
              verb="show submission"
              on:toggleStart={handleToggleSubmissionStart}
              on:toggleEnd={handleToggleSubmissionEnd}><EyeIcon /></Button
            >
            <Zoom />
          </div>
          <div>
            {#if $isLastRound}
              <Button
                button={$environment.getButton('submit')}
                verb="show results"
                on:click={() => actor.send({ type: 'NEXT' })}>Show results</Button
              >
            {:else}
              <Button
                button={$environment.getButton('submit')}
                verb="go to next round"
                on:click={() => actor.send({ type: 'NEXT' })}>Next round</Button
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
        <div class="w-full grid grid-cols-[1fr_max-content_1fr] items-center place-items-end gap-2">
          <div class="grid grid-flow-col gap-2 self-center">
            <Button
              button={$environment.getButton('toggle')}
              verb="toggle image"
              on:toggleStart={handleToggleImageStart}
              on:toggleEnd={handleToggleImageEnd}><EyeIcon /></Button
            >
            <Zoom />
          </div>
          <div>
            <Button
              button={$environment.getButton('submit')}
              disabled={!canSubmit}
              verb="submit"
              on:click={handleSubmit}>Submit</Button
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
