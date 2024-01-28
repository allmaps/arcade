<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte'
  import { Tooltip } from 'bits-ui'

  import ArcadeButtonIcon from '$lib/components/ArcadeButtonIcon.svelte'

  import { flyAndScale } from '$lib/shared/transitions.js'
  import { isTouchDevice } from '$lib/shared/touch.js'

  import type { Button } from '$lib/shared/types.js'

  const dispatch = createEventDispatcher()

  export let button: Button
  export let verb: string
  export let timeout = 0

  let active = false

  let timeoutId: number

  let element: HTMLButtonElement

  let touch = false

  function handleKeypress(event: KeyboardEvent) {
    if (event.code === button.keyCode && !event.repeat) {
      dispatch('click')
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.code === button.keyCode && !event.repeat) {
      active = true

      element.dispatchEvent(new Event('mousedown'))
      element.dispatchEvent(
        new MouseEvent('mousedown', {
          view: window,
          bubbles: true,
          cancelable: true,
          clientX: 1200,
          clientY: 100,
          button: 0
        })
      )
      // touch ? dispatch('touchstart') : dispatch('mousedown')
    }
  }

  function handleKeyup(event: KeyboardEvent) {
    if (event.code === button.keyCode && !event.repeat) {
      active = false

      element.dispatchEvent(new Event('mouseup'))
      // touch ? dispatch('touchend') : dispatch('mouseup')
    }
  }

  onMount(() => {
    touch = isTouchDevice()

    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        element.dispatchEvent(new Event('click'))
      }, timeout)
    }

    return () => clearTimeout(timeoutId)
  })
</script>

<svelte:document on:keypress={handleKeypress} on:keydown={handleKeydown} on:keyup={handleKeyup} />

<Tooltip.Root openDelay={1000}>
  <Tooltip.Trigger>
    <button
      bind:this={element}
      on:mousedown
      on:mouseup
      on:touchstart|passive
      on:touchend
      type="button"
      class:active
      class="px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4 group relative transition-all duration-75 top-0 shadow-md h-min w-fit text-white bg-pink-300 font-medium rounded-full pointer-events-auto overflow-hidden focus:outline-none"
      on:click
    >
      <div
        style="animation-duration: {timeout}ms;"
        class="timeout absolute w-full h-full top-0 left-0 transition-all group-active:bg-pink-400 {active
          ? 'bg-pink-400'
          : 'bg-green'}"
      />
      <div class="relative"><slot /></div></button
    >
  </Tooltip.Trigger>
  <Tooltip.Content
    transition={flyAndScale}
    transitionConfig={{ y: 8, duration: 150 }}
    sideOffset={8}
  >
    <div class="bg-white">
      <Tooltip.Arrow class="rounded-[2px]" />
    </div>
    <div
      class="flex items-center justify-center rounded-lg bg-white px-3 py-1 text-black text-sm shadow-lg outline-none"
    >
      Press <ArcadeButtonIcon {button} /> to {verb}
    </div>
  </Tooltip.Content>
</Tooltip.Root>

<style scoped lang="postcss">
  .active,
  button:active {
    @apply shadow-sm top-[1px];
  }
</style>
