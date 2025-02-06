<script lang="ts">
  import { onMount } from 'svelte'
  import { fade } from 'svelte/transition'

  import { formatScore } from '$lib/shared/format.js'

  import { getTimerState } from '$lib/shared/stores/timer.svelte.js'
  import { getGameTimeoutState } from '$lib/shared/stores/game-timeout.svelte.js'
  import { getSnapshotState } from '$lib/shared/stores/snapshot.svelte'

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

  import type { SnapshotFrom } from 'xstate'

  import type { GameMachine } from '$lib/shared/machines/game.js'

  import type { KeyboardTarget, LoadedRound } from '$lib/shared/types.js'

  import { AUTO_ADVANCE_MS } from '$lib/shared/constants.js'
  import { NUMBER_OF_ROUNDS } from '$lib/shared/constants.js'

  const { snapshot, send, actorRef, currentRound, keyboardTarget, isLastRound, totalScore } =
    getSnapshotState()
  const gameTimeoutState = getGameTimeoutState()
  const timerState = getTimerState()

  let containerImage = $state<HTMLElement>()
  let containerMap = $state<HTMLElement>()

  let bgClass = $state($currentRound?.colors.bgClass)

  let image = $state<Image>()
  let map = $state<Map>()

  let startTime: number
  let intervalId: number

  let ready = $state(false)
  let imageReady = $state(false)

  let annotationReady = $derived(!$snapshot.matches('round.progress.loading'))

  // When SUBMIT event is received, submitted is set to true
  // Using $snapshot.matches('round.display.submitted') caused
  // strange race-condition bugs with svelte/transition
  // TODO: check!
  // let submitted = $state(false)
  let submitted = $derived($snapshot.matches('round.progress.submitted'))

  // let found = false

  function focusElement(element: HTMLElement, keyboardTarget: KeyboardTarget) {
    if (!element) {
      return
    }

    // This is a hack to ensure sure $olTarget's container
    // is visible before focusing
    element.classList.remove('fade-to-invisible')
    keyboardTarget.element.focus()
  }

  let displayImage = $derived($snapshot.matches('round.display.image'))
  let displayMap = $derived($snapshot.matches('round.display.map'))

  let loading = $derived($snapshot.matches('round.progress.loading'))
  let intro = $derived($snapshot.matches('round.progress.intro'))

  let showLargeRoundScore = $derived(
    $snapshot.matches('round.progress.submitted.animating') ||
      $snapshot.matches('round.progress.submitted.score')
  )

  let canSubmit = $derived((($currentRound as LoadedRound)?.canSubmit || false) && displayMap)

  $effect(() => {
    if ($keyboardTarget) {
      if (displayImage && containerImage) {
        focusElement(containerImage, $keyboardTarget)
      } else if (displayMap && containerMap) {
        focusElement(containerMap, $keyboardTarget)
      }
    }
  })

  function handleTransition(snapshot: SnapshotFrom<GameMachine>) {
    if (snapshot.matches('round.progress.loading')) {
      ready = false
    }

    if (snapshot.matches('round.progress.submitted.animating')) {
      stopTimer()

      // if ($currentRound?.submitted) {
      //   found = $currentRound.submission?.found
      // }
    }

    bgClass = $currentRound?.colors.bgClass
  }

  function getTime() {
    const date = new Date()
    return date.getTime()
  }

  function updateTimer() {
    timerState.endTime = getTime()
  }

  function handleImageReady() {
    imageReady = true
  }

  function handleLoadingReady() {
    startTimer()
    ready = true
  }

  function handleSubmit() {
    if (map) {
      send({
        type: 'SUBMIT',
        endTime: timerState.endTime,
        submission: map.getSubmission()
      })
    }
  }

  function startTimer() {
    intervalId = setInterval(updateTimer, 1000)
  }

  function stopTimer() {
    clearInterval(intervalId)
  }

  function handleToggleImageStart() {
    send({ type: 'SHOW_IMAGE' })
  }

  function handleToggleImageEnd() {
    send({ type: 'SHOW_MAP' })
  }

  function handleToggleSubmissionStart() {
    gameTimeoutState.resetLastInteraction()
    map?.flyToSubmission()
  }

  function handleToggleSubmissionEnd() {
    gameTimeoutState.resetLastInteraction()
    map?.flyToWarpedMap()
  }

  onMount(() => {
    startTime = getTime()
    // startTimer()

    const subscription = actorRef.subscribe(handleTransition)

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
        <Image bind:this={image} onready={handleImageReady} />
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
        onready={handleLoadingReady}
      />
    </div>
  {/if}
</div>
<Overlay>
  {#snippet header()}
    <Header>
      {#snippet left()}
        {#if $snapshot.matches('round')}
          <HeaderItem>
            <span class="hidden sm:inline">Round</span><span class="sm:hidden">#</span>
            <span class="[letter-spacing:theme(spacing.1)]"
              >{$currentRound?.number}/{NUMBER_OF_ROUNDS}</span
            >
          </HeaderItem>
        {/if}
      {/snippet}

      {#if $snapshot.matches('round.progress.playing')}
        <div transition:fade class="contents">
          <Timer />
        </div>
      {:else if $currentRound?.submitted && $snapshot.matches('round.progress.submitted.review')}
        <div transition:fade class="contents">
          <Score round={$currentRound} border={false} />
        </div>
      {/if}

      {#snippet right()}
        <HeaderItem>
          {formatScore($snapshot.context.configuration, $totalScore)}
          <span class="hidden sm:inline">Points</span><span class="sm:hidden">Pts</span>
        </HeaderItem>
      {/snippet}
    </Header>
  {/snippet}

  <div>
    {#if $currentRound?.submitted && showLargeRoundScore}
      <!-- TODO: use place-self instead of full size absolute element -->
      <div
        in:fade={{ duration: 500 }}
        out:fade={{ duration: 150 }}
        class="absolute w-full h-full top-0 left-0 flex justify-center items-center pointer-events-none"
      >
        <ScoreLarge round={$currentRound} />
      </div>
    {/if}
  </div>

  {#snippet footer()}
    {#if ready}
      <Footer showNorthArrow={true}>
        {#snippet buttons()}
          {#if intro}
            <Buttons>
              <Zoom />
            </Buttons>
          {:else if !submitted}
            <Buttons>
              <Button
                button={$snapshot.context.environment.getButton('toggle')}
                verb="toggle image"
                ontogglestart={handleToggleImageStart}
                ontoggleend={handleToggleImageEnd}><ArrowsIcon /></Button
              >
              <Zoom />
            </Buttons>
          {:else if submitted}
            <Buttons>
              <Button
                button={$snapshot.context.environment.getButton('toggle')}
                verb="show submission"
                ontogglestart={handleToggleSubmissionStart}
                ontoggleend={handleToggleSubmissionEnd}><ArrowsIcon /></Button
              >
              <Zoom />
            </Buttons>
          {/if}
        {/snippet}

        {#if intro}
          <Button
            timeout={AUTO_ADVANCE_MS}
            verb="show map"
            button={$snapshot.context.environment.getButton('submit')}
            onclick={() => send({ type: 'START' })}>Show map</Button
          >
        {:else if !submitted}
          <Button
            button={$snapshot.context.environment.getButton('submit')}
            disabled={!canSubmit}
            verb="submit"
            onclick={handleSubmit}>Submit</Button
          >
        {:else if submitted}
          {#if $isLastRound}
            <Button
              button={$snapshot.context.environment.getButton('submit')}
              verb="show results"
              onclick={() => send({ type: 'NEXT' })}>Show results</Button
            >
          {:else}
            <Button
              button={$snapshot.context.environment.getButton('submit')}
              verb="go to next round"
              onclick={() => send({ type: 'NEXT' })}>Next round</Button
            >
          {/if}
        {/if}
      </Footer>
    {/if}
  {/snippet}
</Overlay>
