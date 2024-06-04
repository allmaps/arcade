<script lang="ts">
  import NorthArrow from '$lib/components/NorthArrow.svelte'

  export let showNorthArrow = false
</script>

<footer class="flex flex-row w-full justify-center items-center pointer-events-none">
  <div class="w-full grid grid-cols-[1fr_max-content_1fr] items-center place-items-end gap-2">
    <div class="grid grid-flow-col gap-2 self-center">
      <slot name="buttons" />
    </div>
    <div>
      <slot />
    </div>
    <div class="place-self-end">
      {#if showNorthArrow}
        <NorthArrow />
      {/if}
    </div>
  </div>
</footer>
