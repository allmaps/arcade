<script lang="ts">
  import { onMount } from 'svelte'
  import { fade } from 'svelte/transition'

  import Footer from '$lib/components/Footer.svelte'
  import Button from '$lib/components/Button.svelte'

  import { getSnapshotState } from '$lib/shared/stores/snapshot.svelte.js'

  import { geometryToPath } from '$lib/shared/svg.js'

  import type { GeojsonPolygon } from '@allmaps/types'

  import Overlay from '$lib/components/Overlay.svelte'
  import ArrowsIcon from '$lib/components/ArrowsIcon.svelte'
  import About from '$lib/components/About.svelte'
  import ExplainItemContainer from '$lib/components/ExplainItemContainer.svelte'
  import Explain1 from '$lib/components/explain/Explain1.svelte'
  import Explain2 from '$lib/components/explain/Explain2.svelte'
  import Explain3 from '$lib/components/explain/Explain3.svelte'

  import lomanBuurtQQ from '$lib/explain/loman-buurt-qq.jpg'
  import lomanBuurtQQWarped from '$lib/explain/loman-buurt-qq-warped.jpg'
  import protomapsAmsterdam from '$lib/explain/protomaps-amsterdam.jpg'
  import lomanBuurtQQGeoMaskImported from '$lib/explain/loman-buurt-qq.json'

  import { EXPLAIN_STEP_MS } from '$lib/shared//constants.js'

  const lomanBuurtQQGeoMask = lomanBuurtQQGeoMaskImported as GeojsonPolygon

  const { snapshot, send } = getSnapshotState()

  let intervalId: number | undefined
  let step = $state(0)

  let showAbout = $state(false)

  function handleToggleAboutStart() {
    showAbout = true
  }

  function handleToggleAboutEnd() {
    showAbout = false
  }

  onMount(() => {
    intervalId = setInterval(() => {
      step = (step + 1) % 4
    }, EXPLAIN_STEP_MS)

    return () => clearInterval(intervalId)
  })
</script>

<div
  class="absolute w-full h-full p-4 lg:p-8 bg-darkblue text-white flex justify-center lg:text-lg"
>
  <Overlay>
    <ol
      class="text-xs md:text-base lg:text-lg pointer-events-auto h-full min-h-0 max-w-6xl
        gap-4 lg:gap-8 place-content-center md:grid-rows-[min-content_minmax(100px,min-content)_min-content]
        grid grid-rows-3 md:grid-cols-3 items-stretch md:items-center"
    >
      <ExplainItemContainer title="Inspect historic map" image={lomanBuurtQQ} highlight={step > 0}>
        <Explain1 />
      </ExplainItemContainer>

      <ExplainItemContainer title="Find location" image={protomapsAmsterdam} highlight={step > 1}>
        <Explain2 />

        {#snippet imageOverlay()}
          <div class="absolute top-o w-full h-full p-2">
            <svg
              class="w-full h-full top-0"
              width="100%"
              height="100%"
              viewBox="0 0 100 100"
              preserveAspectRatio="xMidYMid meet"
            >
              <path
                vector-effect="non-scaling-stroke"
                transform-origin="50 50"
                class="transition-all duration-300 fill-none z-0 stroke-darkblue stroke-[8] md:stroke-[12]"
                d={geometryToPath(lomanBuurtQQGeoMask)}
              />
            </svg>
          </div>
        {/snippet}
      </ExplainItemContainer>

      <ExplainItemContainer
        title="Put down the map"
        image={lomanBuurtQQWarped}
        highlight={step > 2}
      >
        <Explain3 />
      </ExplainItemContainer>
    </ol>

    {#if showAbout}
      <div
        transition:fade={{ duration: 100 }}
        class="h-full w-full top-0 absolute flex justify-center items-center"
      >
        <About />
      </div>
    {/if}

    {#snippet footer()}
      <Footer>
        {#snippet buttons()}
          <Button
            button={$snapshot.context.environment.getButton('toggle')}
            verb="learn more about Allmaps Arcade"
            ontogglestart={handleToggleAboutStart}
            ontoggleend={handleToggleAboutEnd}><ArrowsIcon /></Button
          >
        {/snippet}
        <Button
          button={$snapshot.context.environment.getButton('submit')}
          verb="start playing"
          onclick={() => send({ type: 'NEXT' })}>Start playing</Button
        >
      </Footer>
    {/snippet}
  </Overlay>
</div>
