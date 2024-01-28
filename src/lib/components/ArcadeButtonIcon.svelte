<script lang="ts">
  import type { Button } from '$lib/shared/types.js'

  export let button: Button
</script>

{#if button.keyLabel}
  <kbd
    class="inline-block px-1 py-2 -top-2 rounded-md bg-gray/30 border border-black/10 shadow-inner bg-blend-overlay"
    >{button.keyLabel}</kbd
  >
{:else}
  <span class="inline-block relative mx-1 top-0.5 w-4 h-4 rounded-full {button.bgClass}" />
{/if}

<!-- TODO: replace css with tailwind styles -->
<style>
  kbd {
    padding: 3px 5px;
    /* background-color: rgba(255, 255, 255, 0.3); */
    /* border: solid 1px rgba(255, 255, 255, 0.5); */
    border-bottom-color: rgba(255, 255, 255, 0.5);
    box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.4);
  }
</style>
