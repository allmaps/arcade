<script lang="ts">
  import { uniqBy } from 'lodash-es'

  import Footer from '$lib/components/Footer.svelte'
  import Button from '$lib/components/Button.svelte'
  import Overlay from '$lib/components/Overlay.svelte'

  import { getSnapshotState } from '$lib/shared/stores/snapshot.svelte.js'

  import { formatScore, formatTimeAgo } from '$lib/shared/format'

  const HIGHSCORE_MAX_DISPLAY_COUNT = 10

  const { send, snapshot, highscores, lastHighscore } = getSnapshotState()

  const colors = ['bg-red', 'bg-blue', 'bg-yellow', 'bg-purple', 'bg-orange', 'bg-green', 'bg-pink']

  function isLastHighscore(id: string) {
    return id === $lastHighscore?.id
  }

  const allHighscores = $derived(
    uniqBy([...$highscores, ...($lastHighscore ? [$lastHighscore] : [])], 'id').toSorted(
      (a, b) => b.score - a.score
    )
  )
</script>

<div
  class="absolute w-full h-full p-4 lg:p-8 bg-darkblue text-white flex justify-center items-center lg:text-lg"
>
  <Overlay>
    <div class="min-h-0 h-full pointer-events-auto flex flex-col gap-4">
      <h1 class="text-xl hlg:text-6xl uppercase text-center">Highscores</h1>
      <div class="h-full flex items-center overflow-auto">
        <ol
          class="text-base whsm:text-lg whmd:text-xl grid grid-cols-[repeat(4,max-content)] gap-1 h-min"
        >
          {#each allHighscores.slice(0, HIGHSCORE_MAX_DISPLAY_COUNT) as highscore, index}
            <li
              class="p-1 whsm:p-2 whmd:p-3 whlg:p-4 gap-2 whsm:gap-3 whmd:gap-4 grid col-span-4 grid-cols-subgrid rounded-full items-center
            {isLastHighscore(highscore.id) ? 'bg-white/20' : ''}"
            >
              <div>
                <div
                  class="flex justify-center items-center text-center rounded-full size-5 whmd:size-10 {colors[
                    index % colors.length
                  ]} {index + 1 > 9 ? 'whsm:text-sm whmd:text-lg' : ''} shadow-md font-bold"
                >
                  {index + 1}
                </div>
              </div>
              <div class="font-bold tracking-widest">{highscore.name}</div>
              <div class="text-right capitalize">
                {formatScore($snapshot.context.configuration, highscore.score)}
              </div>
              <div class="font-light text-sm whlg:text-lg hidden whmd:inline">
                {formatTimeAgo(highscore.date)}
              </div>
            </li>
          {/each}
        </ol>
      </div>
    </div>

    {#snippet footer()}
      <Footer>
        <Button
          button={$snapshot.context.environment.getButton('submit')}
          verb="start playing"
          onclick={() => send({ type: 'NEXT' })}>New game</Button
        >
      </Footer>
    {/snippet}
  </Overlay>
</div>
