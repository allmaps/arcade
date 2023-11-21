<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte'

  import { isTouchDevice } from '$lib/shared/touch.js'

  const dispatch = createEventDispatcher()

  export let timeout = 0
  export let disabled = false
  export let shortcutKey: string | undefined = undefined

  let timeoutId: number

  let button: HTMLButtonElement

  let touch = false

  function handleKeypress(event: KeyboardEvent) {
    if (event.key === shortcutKey && !event.repeat) {
      dispatch('click')
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === shortcutKey && !event.repeat) {
      button.dispatchEvent(new Event('mousedown'))
      button.dispatchEvent(
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
    if (event.key === shortcutKey && !event.repeat) {
      button.dispatchEvent(new Event('mouseup'))
      // touch ? dispatch('touchend') : dispatch('mouseup')
    }
  }

  onMount(() => {
    touch = isTouchDevice()

    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        button.dispatchEvent(new Event('click'))
      }, timeout)
    }

    if (shortcutKey) {
      document.addEventListener('keypress', handleKeypress)
      document.addEventListener('keydown', handleKeydown)
      document.addEventListener('keyup', handleKeyup)
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      if (shortcutKey) {
        document.removeEventListener('keypress', handleKeypress)
        document.removeEventListener('keydown', handleKeydown)
        document.removeEventListener('keyup', handleKeyup)
      }
    }
  })
</script>

<button
  bind:this={button}
  on:mousedown
  on:mouseup
  on:touchstart|passive
  on:touchend
  {disabled}
  type="button"
  class="group relative h-min w-fit text-white bg-purple-300 disabled:bg-gray-400 font-medium rounded-full px-8 py-4 mr-2 focus:outline-none pointer-events-auto overflow-hidden"
  on:click
>
  <div
    id="button-background"
    style="--transition-duration: {timeout}ms;"
    class="absolute bg-purple w-full h-full top-0 left-0 transition-all group-active:bg-darkblue"
  />
  <div class="relative"><slot /></div></button
>

<style>
  #button-background {
    animation-duration: var(--transition-duration);
    animation-name: timeout;
    animation-timing-function: linear;
    animation-iteration-count: 1;
  }

  @keyframes timeout {
    from {
      width: 0%;
    }

    to {
      width: 100%;
    }
  }
</style>
