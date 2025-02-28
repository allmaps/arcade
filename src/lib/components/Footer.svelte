<script lang="ts">
  import NorthArrow from '$lib/components/NorthArrow.svelte'

  import type { Snippet } from 'svelte'

  type Props = {
    showNorthArrow?: boolean
    buttons?: Snippet
    children?: Snippet
  }

  let { showNorthArrow = false, buttons, children }: Props = $props()
</script>

<footer class="flex flex-row w-full justify-center items-center pointer-events-none">
  <div class="w-full grid grid-cols-[1fr_max-content_1fr] items-center place-items-end gap-2">
    <div class="grid grid-flow-col gap-2 self-center">
      {@render buttons?.()}
    </div>
    <div>
      {@render children?.()}
    </div>
    <div class="place-self-end">
      {#if showNorthArrow}
        <NorthArrow />
      {/if}
    </div>
  </div>
</footer>
