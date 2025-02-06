<script lang="ts">
  import type { Snippet } from 'svelte'

  type Props = {
    children?: Snippet
  }

  let { children }: Props = $props()
</script>

<div
  class="shadow-sm font-bold bg-white px-3 py-1 sm:px-6 sm:py-2 rounded-full
    pointer-events-auto [word-spacing:theme(spacing.1)]"
>
  {@render children?.()}
</div>
