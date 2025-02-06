<script lang="ts">
  import { fade } from 'svelte/transition'

  type Props = {
    timeout: number
  }

  let { timeout }: Props = $props()
</script>

<div
  transition:fade
  class="relative z-50 w-full h-full flex items-center justify-center bg-black/75"
>
  <div
    class="relative top-0 shadow-md bg-blue-200 font-medium rounded-full px-8 py-4 overflow-hidden"
  >
    <div
      style="animation-duration: {timeout}ms;"
      class="timeout absolute w-full h-full top-0 left-0 bg-blue"
    ></div>
    <div class="relative">Press any key to continue</div>
  </div>
</div>
