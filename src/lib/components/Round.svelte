<script lang="ts">
  import { onMount } from 'svelte'
  import { fade } from 'svelte/transition'

  import { configuration } from '$lib/shared/machines/game.js'
  import { NUMBER_OF_ROUNDS } from '$lib/shared/constants.js'
  import { formatScore } from '$lib/shared/format.js'

  import {
    actor,
    state,
    totalScore,
    currentRound,
    isLastRound,
    keyboardTarget,
    type Snapshot
  } from '$lib/shared/machines/game.js'
  import { endTime } from '$lib/shared/stores/timer.js'
  import { environment } from '$lib/shared/stores/environment.js'
  import { resetLastInteraction } from '$lib/shared/stores/game-timeout.js'

  import Overlay from '$lib/components/Overlay.svelte'
  import Header from '$lib/components/Header.svelte'
  import HeaderItem from '$lib/components/HeaderItem.svelte'
  import Footer from '$lib/components/Footer.svelte'
  import Buttons from '$lib/components/Buttons.svelte'
  import Button from '$lib/components/Button.svelte'
  import RoundLoading from '$lib/components/RoundLoading.svelte'
  import Image from '$lib/components/Image.svelte'
  import Map from '$lib/components/Map.svelte'
  import Zoom from '$lib/components/Zoom.svelte'
  import ArrowsIcon from '$lib/components/ArrowsIcon.svelte'
  import Score from '$lib/components/Score.svelte'
  import ScoreLarge from '$lib/components/ScoreLarge.svelte'
  import Timer from '$lib/components/Timer.svelte'

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

  $: loading = $state.matches('round.progress.loading')
  $: intro = $state.matches('round.progress.intro')

  $: showLargeRoundScore =
    $state.matches('round.progress.submitted.animating') ||
    $state.matches('round.progress.submitted.score')

  $: canSubmit = (($currentRound as LoadedRound)?.canSubmit || false) && displayMap

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
    if (snapshot.matches('round.progress.submitted')) {
      // stopTimer()
      submitted = true
    }

    if (snapshot.matches('round.progress.submitted.animating')) {
      stopTimer()
      // submitted = true
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
  {#if loading || intro}
    {#if intro}
      <div
        bind:this={containerImage}
        in:fade={{ duration: 1000 }}
        class="absolute w-full h-full left-0 top-0"
      >
        <Image bind:this={image} on:ready={handleImageReady} />
      </div>
    {/if}
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
  {/if}

  {#if !ready}
    <div transition:fade class="absolute w-full h-full top-0 {bgClass}">
      <RoundLoading
        annotationLoading={!annotationReady}
        imageLoading={!imageReady}
        on:ready={handleLoadingReady}
      />
    </div>
  {/if}
</div>
<Overlay>
  <Header slot="header">
    <svelte:fragment slot="left">
      {#if $state.matches('round')}
        <HeaderItem>
          <span class="hidden sm:inline">Round</span><span class="sm:hidden">#</span>
          <span class="[letter-spacing:theme(spacing.1)]"
            >{$currentRound?.number}/{NUMBER_OF_ROUNDS}</span
          >
        </HeaderItem>
      {/if}
    </svelte:fragment>

    {#if $state.matches('round.progress.playing')}
      <div transition:fade class="contents">
        <Timer />
      </div>
    {:else if $currentRound?.submitted && $state.matches('round.progress.submitted.review')}
      <div transition:fade class="contents">
        <Score round={$currentRound} border={false} />
      </div>
    {/if}

    <svelte:fragment slot="right">
      <HeaderItem>
        {formatScore($configuration, $totalScore)} <span class="hidden sm:inline">Points</span><span
          class="sm:hidden">Pts</span
        >
      </HeaderItem>
    </svelte:fragment>
  </Header>

  <div>
    {#if $currentRound?.submitted && showLargeRoundScore}
      <!-- TODO: use place-self instead of full size absolute element -->
      <div
        in:fade={{ duration: 500 }}
        out:fade={{ duration: 150 }}
        class="absolute w-full h-full top-0 left-0 flex justify-center items-center pointer-events-none"
      >
        <ScoreLarge round={$currentRound} {found} />
      </div>
    {/if}
  </div>

  <svelte:fragment slot="footer">
    {#if ready}
      <Footer showNorthArrow={true}>
        <svelte:fragment slot="buttons">
          {#if intro}
            <Buttons>
              <Zoom />
            </Buttons>
          {:else if !submitted}
            <Buttons>
              <Button
                button={$environment.getButton('toggle')}
                verb="toggle image"
                on:toggleStart={handleToggleImageStart}
                on:toggleEnd={handleToggleImageEnd}><ArrowsIcon /></Button
              >
              <Zoom />
            </Buttons>
          {:else if submitted}
            <Buttons>
              <Button
                button={$environment.getButton('toggle')}
                verb="show submission"
                on:toggleStart={handleToggleSubmissionStart}
                on:toggleEnd={handleToggleSubmissionEnd}><ArrowsIcon /></Button
              >
              <Zoom />
            </Buttons>
          {/if}
        </svelte:fragment>

        {#if intro}
          <Button
            timeout={AUTO_ADVANCE_MS}
            verb="show map"
            button={$environment.getButton('submit')}
            on:click={() => actor.send({ type: 'START' })}>Show map</Button
          >
        {:else if !submitted}
          <Button
            button={$environment.getButton('submit')}
            disabled={!canSubmit}
            verb="submit"
            on:click={handleSubmit}>Submit</Button
          >
        {:else if submitted}
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
        {/if}
      </Footer>
    {/if}
  </svelte:fragment>
</Overlay>
