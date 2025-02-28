<script lang="ts">
  import { fade } from 'svelte/transition'

  import { Logo } from '@allmaps/ui'

  import { getSnapshotState } from '$lib/shared/stores/snapshot.svelte'

  import Overlay from '$lib/components/Overlay.svelte'
  import Masks from '$lib/components/Masks.svelte'
  import Footer from '$lib/components/Footer.svelte'
  import Button from '$lib/components/Button.svelte'
  import ArrowsIcon from '$lib/components/ArrowsIcon.svelte'
  import About from '$lib/components/About.svelte'

  let showAbout = $state(false)

  function handleToggleAboutStart() {
    showAbout = true
  }

  function handleToggleAboutEnd() {
    showAbout = false
  }

  const { snapshot, send } = getSnapshotState()
</script>

<div class="relative contents">
  <div class="absolute -z-10 top-0 left-0 w-full h-full overflow-hidden">
    <Masks />
  </div>

  <Overlay>
    <main class="relative w-full h-full [&>*]:absolute">
      {#if !showAbout}
        <div
          transition:fade={{ duration: 100 }}
          class="w-full h-full flex flex-col gap-2 sm:gap-4 md:gap-10 justify-center items-center overflow-hidden"
        >
          <h1
            class="text-white text-3xl md:text-4xl lg:text-6xl font-bold text-center drop-shadow-md leading-tight"
          >
            Allmaps<span
              class="m-0.5 w-16 md:w-24 lg:m-1 lg:w-32 relative inline-block [&>*]:inline-block -top-1"
              ><Logo inverted={true} /></span
            ><span class="font-normal">Arcade</span>
          </h1>
          <h2
            class="text-white text-xl sm:text-2xl lg:text-4xl text-center font-bold max-w-lg lg:max-w-2xl drop-shadow-sm"
          >
            Put the historical maps back where they belong! Be quick. The faster you are, the more
            points you'll earn.
          </h2>
        </div>
      {:else}
        <div
          transition:fade={{ duration: 100 }}
          class="h-full w-full flex justify-center items-center"
        >
          <About />
        </div>
      {/if}
    </main>
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
          verb="start new game"
          onclick={() => send({ type: 'NEXT' })}>Start new game</Button
        >
      </Footer>
    {/snippet}
  </Overlay>
</div>
