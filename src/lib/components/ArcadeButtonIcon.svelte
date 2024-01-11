<script lang="ts">
  import type { Button } from '$lib/shared/types.js'

  export let button: Button
</script>

{#if button.keyLabel}
  <kbd class="inline-block px-1 py-2 -top-2 rounded-md text-white/75">{button.keyLabel}</kbd>
{:else}
  <span class="inline-block relative mx-1 top-0.5 w-4 h-4 rounded-full {button.bgClass}" />
{/if}

<style>
  kbd {
    padding: 3px 5px;
    /* font: 11px ui-monospace, SFMono-Regular, SF Mono, Menlo, Consolas, Liberation Mono, monospace; */
    /* line-height: 10px; */
    /* vertical-align: middle; */
    background-color: rgba(255, 255, 255, 0.3);
    border: solid 1px rgba(255, 255, 255, 0.5);
    border-bottom-color: rgba(255, 255, 255, 0.5);

    box-shadow: inset 0 -1px 0 rgba(255, 255, 255, 0.4);
  }
</style>
