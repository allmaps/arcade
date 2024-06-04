<script lang="ts">
  const hasHeader = $$slots.header !== undefined
  const hasContent = $$slots.default !== undefined

  const gridRowsWithHeader = 'grid-rows-[min-content,1fr,min-content]'
  const gridRowsWithoutHeader = 'grid-rows-[1fr,min-content]'
</script>

<section
  class="absolute top-0 left-0 w-full h-full max-h-full
  p-2 sm:p-3 md:p-4 lg:p-6 gap-2 sm:gap-3 md:gap-4 lg:gap-6 z-10 pointer-events-none
  grid {hasHeader ? gridRowsWithHeader : gridRowsWithoutHeader} justify-items-center items-center"
>
  <slot name="header" />

  {#if hasContent}
    <slot />
  {:else}
    <div></div>
  {/if}

  <slot name="footer" />
</section>
