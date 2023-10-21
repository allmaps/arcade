<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte'

  const dispatch = createEventDispatcher()

  export let timeout = 0
  export let disabled = false
  export let shortcutKey: string | undefined = undefined

  let timeoutId: number

  let button: HTMLButtonElement

  function handleKeypress(event: KeyboardEvent) {
    if (event.key === shortcutKey && !event.repeat) {
      button.dispatchEvent(new Event('click'))
    }
  }

  onMount(() => {
    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        button.dispatchEvent(new Event('click'))
      }, timeout)
    }

    if (shortcutKey) {
      document.addEventListener('keypress', handleKeypress)
    }

    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId)
      }

      if (shortcutKey) {
        document.removeEventListener('keypress', handleKeypress)
      }
    }
  })
</script>

<button
  bind:this={button}
  {disabled}
  type="button"
  class="relative h-min w-fit text-white bg-purple-300 disabled:bg-gray-400 border-purple-600 border-8 font-medium rounded-full px-5 py-2.5 mr-2 focus:outline-none pointer-events-auto overflow-hidden"
  on:click
>
  <div
    id="button-background"
    style="--transition-duration: {timeout}ms;"
    class="absolute bg-purple w-full h-full top-0 left-0 transition-all"
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
