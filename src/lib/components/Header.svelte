<script lang="ts">
  import type { Snippet } from 'svelte'

  type Props = {
    left?: Snippet
    right?: Snippet
    children?: Snippet
  }

  let { left, right, children }: Props = $props()

  const hasLeft = left !== undefined
  const hasRight = right !== undefined

  const hasOnlyCenter = !hasLeft && !hasRight

  const gridColsClass = hasOnlyCenter ? 'grid-cols-1' : 'grid-cols-[1fr_max-content_1fr]'
</script>

<header class="z-10 grid grid-flow-col {gridColsClass} w-full pointer-events-none gap-4">
  {#if !hasOnlyCenter}
    <div class="justify-self-start">
      {@render left?.()}
    </div>
  {/if}
  <div class={hasOnlyCenter ? '' : 'place-self-center'}>
    {@render children?.()}
  </div>
  {#if !hasOnlyCenter}
    <div class="justify-self-end">
      {@render right?.()}
    </div>
  {/if}
</header>
