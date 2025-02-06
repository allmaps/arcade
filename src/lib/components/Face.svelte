<script lang="ts">
  import type { Snippet } from 'svelte'

  type Props = {
    href: string
    name: string
    children?: Snippet
  }

  let { href, name, children }: Props = $props()
</script>

<a
  {href}
  class="no-underline [&>img]:w-6 [&>img]:inline-block [&>img]:rounded-lg [&>img]:m-0 whitespace-nowrap"
>
  {@render children?.()}
  <span class="underline">{name}</span>
</a>
