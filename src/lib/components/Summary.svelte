<script lang="ts">
  import { gameService } from '$lib/shared/machines/game.js'

  import Thumbnail from './Thumbnail.svelte'
  import Footer from '$lib/components/Footer.svelte'
  import Button from '$lib/components/Button.svelte'
  import ArcadeButtonIcon from '$lib/components/ArcadeButtonIcon.svelte'

  import { BUTTON_1 } from '$lib/shared/constants.js'

  import { rounds } from '$lib/shared/machines/game.js'
</script>

<div class="w-full h-full">
  <ol class="h-full grid grid-cols-5">
    {#each $rounds as round}
      {#if round.submitted}
        <li class={`${round.colors.bgClass} p-4`}>
          <Thumbnail imageInfo={round.imageInfo} width={1200 / 5} height={400} />

          <div>
            {round.score} Points
          </div>
          <div>Area: {Math.round(round.submission.area)} m2</div>
          <div>Zoom: {round.submission.zoom.submission / round.submission.zoom.warpedMap}</div>
          <div>Distance: {Math.round(round.submission.distance)} m</div>
          <div>Time: {(round.endTime - round.startTime) / 1000} s</div>
        </li>
      {/if}
    {/each}
  </ol>
</div>

<Footer>
  <Button shortcutKey={BUTTON_1} on:click={() => gameService.send('NEXT')}
    >Next <ArcadeButtonIcon bgClass="bg-white" />
  </Button>
</Footer>
