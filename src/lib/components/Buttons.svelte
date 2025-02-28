<script lang="ts">
  import type { Snippet } from 'svelte'

  type Props = {
    children?: Snippet
  }

  let { children }: Props = $props()
</script>

<div class="grid grid-flow-col gap-2 self-center">
  {@render children?.()}
</div>
