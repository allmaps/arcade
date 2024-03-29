<script lang="ts">
  import { onMount } from 'svelte'

  import Footer from '$lib/components/Footer.svelte'
  import Button from '$lib/components/Button.svelte'
  import ArcadeButtonIcon from '$lib/components/ArcadeButtonIcon.svelte'

  import { actor } from '$lib/shared/machines/game.js'
  import { environment } from '$lib/shared/stores/environment.js'
  import { isCabinet } from '$lib/shared/cabinet.js'

  import { geometryToPath } from '$lib/shared/svg.js'

  import type { Polygon as GeoJsonPolygon } from 'geojson'

  import lomanBuurtQQ from '$lib/explain/loman-buurt-qq.jpg'
  import lomanBuurtQQWarped from '$lib/explain/loman-buurt-qq-warped.jpg'
  import protomapsAmsterdam from '$lib/explain/protomaps-amsterdam.jpg'
  import lomanBuurtQQGeoMaskImported from '$lib/explain/loman-buurt-qq.json'

  const lomanBuurtQQGeoMask = lomanBuurtQQGeoMaskImported as GeoJsonPolygon

  let intervalId: number | undefined
  let step = 0

  const scaledClass = 'scale-150'

  onMount(() => {
    intervalId = setInterval(() => {
      step = (step + 1) % 4
      // step += 1
    }, 2000)

    return () => clearInterval(intervalId)
  })
</script>

<div
  class="absolute w-full h-full p-4 lg:p-8 bg-darkblue text-white flex justify-center lg:text-lg"
>
  <div
    class="max-w-6xl grid grid-cols-[1fr_minmax(200px,_1fr)] grid-rows-3 md:grid-cols-3 md:grid-rows-[1fr_minmax(200px,_1fr)] items-stretch md:items-center gap-4 lg:gap-8"
  >
    <div
      class="grid col-span-2 grid-cols-subgrid md:grid-cols-none md:grid-rows-subgrid md:col-auto md:row-span-2"
    >
      <div class="md:aspect-square relative rounded-md md:self-end shadow-inner overflow-hidden">
        <div
          class="w-full h-full absolute top-0 bg-cover bg-center transition-transform duration-300 {step >=
          1
            ? scaledClass
            : ''} "
          style="background-image: url({lomanBuurtQQ});"
        ></div>
        <div class="p-2">
          <span
            class="w-10 h-10 inline-block text-center font-bold text-xl leading-10 relative transition-all duration-300 {step >=
            1
              ? 'bg-white'
              : 'bg-white/0'} text-darkblue rounded-full">1</span
          >
        </div>
      </div>
      <div>
        Look at the historic map for clues about the location it depicts — place names, street
        names, the legend or other text on the map. <strong
          >While playing, you can always view the image again by pressing <ArcadeButtonIcon
            button={$environment.getButton('toggle')}
          /></strong
        >.
      </div>
    </div>

    <div
      class="grid col-span-2 grid-cols-subgrid md:grid-cols-none md:grid-rows-subgrid md:col-auto md:row-span-2"
    >
      <div class="md:aspect-square relative rounded-md md:self-end shadow-inner overflow-hidden">
        <div
          class="w-full h-full absolute top-0 bg-cover bg-center transition-transform duration-300 {step >=
          2
            ? scaledClass
            : ''} "
          style="background-image: url({protomapsAmsterdam});"
        ></div>

        <div class="absolute top-o w-full h-full p-2">
          <svg
            class="w-full h-full top-0"
            width="100%"
            height="100%"
            viewBox="0 0 100 100"
            preserveAspectRatio="xMidYMid meet"
          >
            <path
              vector-effect="non-scaling-stroke"
              transform-origin="50 50"
              class="transition-all duration-300 fill-none z-0 stroke-darkblue stroke-[8] md:stroke-[12]"
              d={geometryToPath(lomanBuurtQQGeoMask)}
            />
          </svg>
        </div>

        <div class="p-2">
          <span
            class="w-10 h-10 inline-block text-center font-bold text-xl leading-10 relative transition-all duration-300 {step >=
            2
              ? 'bg-white'
              : 'bg-white/0'} text-darkblue rounded-full">2</span
          >
        </div>
      </div>
      <div>
        Find the right location by moving the map with the {isCabinet ? 'joystick' : 'arrow keys'} and
        zooming in and out with {#if isCabinet}
          the <ArcadeButtonIcon button={$environment.getButton('zoomIn')} /> buttons.
        {:else}
          <ArcadeButtonIcon button={$environment.getButton('zoomIn')} /> and <ArcadeButtonIcon
            button={$environment.getButton('zoomOut')}
          />.
        {/if}
        <strong
          >Press <ArcadeButtonIcon button={$environment.getButton('submit')} /> if you have found the
          right location.</strong
        >
      </div>
    </div>

    <div
      class="grid col-span-2 grid-cols-subgrid md:grid-cols-none md:grid-rows-subgrid md:col-auto md:row-span-2"
    >
      <div class="md:aspect-square relative rounded-md md:self-end shadow-inner overflow-hidden">
        <div
          class="w-full h-full absolute top-0 bg-cover bg-center transition-transform duration-300 {step >=
          3
            ? scaledClass
            : ''} "
          style="background-image: url({lomanBuurtQQWarped});"
        ></div>
        <div class="p-2">
          <span
            class="w-10 h-10 inline-block text-center font-bold text-xl leading-10 relative transition-all duration-300 {step >=
            3
              ? 'bg-white'
              : 'bg-white/0'} text-darkblue rounded-full">3</span
          >
        </div>
      </div>

      <div>
        <strong
          >The quicker you are and the better your guess is, the more points you'll earn</strong
        >. Maps of small areas are worth more points than maps of large areas.
      </div>
    </div>
  </div>
</div>

<Footer>
  <Button
    button={$environment.getButton('submit')}
    verb="start playing"
    on:click={() => actor.send({ type: 'NEXT' })}>Start playing</Button
  >
</Footer>
