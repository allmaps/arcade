<script lang="ts">
  import type { Snippet } from 'svelte'

  type Props = {
    header?: Snippet
    children?: Snippet
    footer?: Snippet
  }

  let { header, children, footer }: Props = $props()
  const hasHeader = header !== undefined
  const hasContent = children !== undefined

  const gridRowsWithHeader = 'grid-rows-[min-content_1fr_min-content]'
  const gridRowsWithoutHeader = 'grid-rows-[1fr_min-content]'
</script>

<section
  class="absolute top-0 left-0 w-full h-full max-h-full
  p-2 sm:p-3 md:p-4 lg:p-6 gap-2 sm:gap-3 md:gap-4 lg:gap-6 z-10 pointer-events-none
  grid {hasHeader ? gridRowsWithHeader : gridRowsWithoutHeader} justify-items-center items-center"
>
  {@render header?.()}

  {#if hasContent}
    {@render children?.()}
  {:else}
    <div></div>
  {/if}

  {@render footer?.()}
</section>
