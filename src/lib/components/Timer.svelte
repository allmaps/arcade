<script lang="ts">
  import { currentRound } from '$lib/shared/machines/game.js'
  import { endTime } from '$lib/shared/stores/timer.js'

  import Time from '$lib/components/Time.svelte'

  let diffTime = 0

  $: {
    if ($currentRound?.loaded) {
      diffTime = Math.max($endTime - $currentRound.startTime, 0)
    }
  }
</script>

<div class="shadow-sm font-bold bg-white/50 px-6 py-2 rounded-full pointer-events-auto">
  <Time milliseconds={diffTime} />
</div>
