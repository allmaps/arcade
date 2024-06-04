<script lang="ts">
  const hasLeft = $$slots.left !== undefined
  const hasRight = $$slots.right !== undefined

  const hasOnlyCenter = !hasLeft && !hasRight

  const gridColsClass = hasOnlyCenter ? 'grid-cols-1' : 'grid-cols-[1fr_max-content_1fr]'
</script>

<header class="z-10 grid grid-flow-col {gridColsClass} w-full pointer-events-none gap-4">
  {#if !hasOnlyCenter}
    <div class="justify-self-start">
      <slot name="left" />
    </div>
  {/if}
  <div class={hasOnlyCenter ? '' : 'place-self-center'}>
    <slot />
  </div>
  {#if !hasOnlyCenter}
    <div class="justify-self-end">
      <slot name="right" />
    </div>
  {/if}
</header>
