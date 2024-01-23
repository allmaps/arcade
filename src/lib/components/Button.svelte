<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte'

  import { isTouchDevice } from '$lib/shared/touch.js'

  import type { Button } from '$lib/shared/types.js'

  const dispatch = createEventDispatcher()

  export let button: Button
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

<button
  bind:this={element}
  on:mousedown
  on:mouseup
  on:touchstart|passive
  on:touchend
  type="button"
  class:active
  class="group relative transition-all duration-75 top-0 shadow-md h-min w-fit text-white bg-pink-300 font-medium rounded-full px-8 py-4 pointer-events-auto overflow-hidden focus:outline-none"
  on:click
>
  <div
    style="animation-duration: {timeout}ms;"
    class="timeout absolute w-full h-full top-0 left-0 transition-all group-active:bg-pink-400 {active
      ? 'bg-pink-400'
      : 'bg-pink'}"
  />
  <div class="relative"><slot /></div></button
>

<style scoped lang="postcss">
  .active,
  button:active {
    @apply shadow-sm top-[1px];
  }
</style>
