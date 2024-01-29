<script lang="ts">
  import type { Button } from '$lib/shared/types.js'

  export let button: Button
  // export let kbdBgClass: string
</script>

{#if button.keyLabel}
  <kbd class="inline-block -top-2 rounded-md bg-white/40 border border-black/10"
    >{button.keyLabel}</kbd
  >
{:else}
  <span class="inline-block relative mx-1 top-0.5 w-4 h-4">
    <span
      class="arcade-button inline-block absolute w-[160%] h-[160%] left-[-30%] top-[-30%] rounded-full {button.bgClass} shadow-inner"
    />
  </span>
{/if}

<style scoped>
  kbd {
    padding: 2px 5px;
    border-bottom-color: rgba(255, 255, 255, 0.5);
    border-bottom-width: 1px;
    box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.4);
  }

  .arcade-button {
    border-bottom-color: rgba(200, 200, 200, 0.5);
    border-bottom-width: 3px;
    box-shadow: inset 0 -1px 2px rgba(70, 70, 70, 0.4);
  }
</style>
