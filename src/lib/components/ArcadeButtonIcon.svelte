<script lang="ts">
  import type { Button } from '$lib/shared/types.js'

  export let button: Button
  // export let kbdBgClass: string
</script>

{#if button.keyLabel}
  <kbd
    class="inline-block px-1 py-2 -top-2 rounded-md bg-white/40 border border-black/10 shadow-inner bg-blend-overlay"
    >{button.keyLabel}</kbd
  >
{:else}
  <span class="inline-block relative mx-1 top-0.5 w-4 h-4">
    <span
      class="chips inline-block absolute w-[160%] h-[160%] left-[-30%] top-[-30%] rounded-full {button.bgClass} shadow-inner"
    />
  </span>
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

  .chips {
    border-bottom-color: rgba(200, 200, 200, 0.5);
    box-shadow: inset 0 -1px 4px rgba(70, 70, 70, 0.4);
    border-bottom-width: 3px;
  }
</style>
