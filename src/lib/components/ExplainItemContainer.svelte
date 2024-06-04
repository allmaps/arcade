<script lang="ts">
  export let title: string
  export let image: string
  export let highlight = false

  const scaledClass = 'scale-150'
</script>

<li
  class="grid gap-4 [grid-template-areas:--template-areas] md:[grid-template-areas:--md-template-areas]
  grid-cols-[minmax(100px,_1fr)_1fr] grid-rows-[min-content_1fr]
  md:grid-cols-none md:grid-rows-subgrid md:row-span-3"
>
  <div
    class="[grid-area:image] md:aspect-square w-full h-full relative rounded-md md:self-end shadow-inner overflow-hidden"
  >
    <div
      class="w-full h-full absolute top-0 bg-cover bg-center transition-transform duration-300 {highlight
        ? scaledClass
        : ''} "
      style="background-image: url({image});"
    ></div>

    {#if $$slots['image-overlay']}
      <div class="absolute top-0 w-full h-full">
        <slot name="image-overlay" />
      </div>
    {/if}
  </div>
  <h2 class="[grid-area:title] text-lg font-bold">{title}</h2>
  <div class="[grid-area:content]">
    <slot />
  </div>
</li>

<style scoped>
  li {
    counter-increment: step;
    --template-areas: 'image title' 'image content';
    --md-template-areas: 'title' 'image' 'content';
  }

  h2::before {
    content: counter(step) '. ';
    opacity: 0.5;
  }
</style>
