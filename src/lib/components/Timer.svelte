<script lang="ts">
  import { currentRound } from '$lib/shared/machines/game.js'
  import { endTime } from '$lib/shared/stores/timer.js'

  import HeaderItem from '$lib/components/HeaderItem.svelte'
  import Time from '$lib/components/Time.svelte'

  let diffTime = 0

  $: {
    if ($currentRound?.loaded) {
      diffTime = Math.max($endTime - $currentRound.startTime, 0)
    }
  }
</script>

<HeaderItem>
  <Time milliseconds={diffTime} />
</HeaderItem>
