<script lang="ts">
  import { onMount } from 'svelte'

  export let timeout = 0
  export let disabled = false

  let button: HTMLButtonElement

  onMount(() => {
    if (timeout > 0) {
      const timeoutId = setTimeout(() => {
        button.dispatchEvent(new Event('click'))
      }, timeout)

      return () => {
        clearTimeout(timeoutId)
      }
    }
  })
</script>

<button
  bind:this={button}
  {disabled}
  type="button"
  class="relative text-white bg-purple-300 border-purple-600 border-8 font-medium rounded-full px-5 py-2.5 mr-2 mb-2 focus:outline-none pointer-events-auto overflow-hidden"
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
