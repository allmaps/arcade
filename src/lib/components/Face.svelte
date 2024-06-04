<script lang="ts">
  export let href: string
  export let name: string
</script>

<a
  {href}
  class="no-underline [&>img]:w-6 [&>img]:inline-block [&>img]:rounded-lg [&>img]:m-0 whitespace-nowrap"
>
  <slot />
  <span class="underline">{name}</span>
</a>
