<script lang="ts">
  import { currentRound } from '$lib/shared/machines/game.js'
  import { endTime } from '$lib/shared/stores/timer.js'

  let seconds: number

  $: {
    let diffTime = 0
    if ($currentRound?.loaded) {
      diffTime = Math.max($endTime - $currentRound.startTime, 0)
    }

    seconds = Math.round(diffTime / 1000)
  }

  function getMinutes(seconds: number) {
    return Math.floor(seconds / 60).toString()
  }

  function getSecondsRemaining(seconds: number) {
    const secondsRemaining = seconds % 60
    return secondsRemaining.toString().padStart(2, '0')
  }
</script>

<div class="flex items-center gap-0.5">
  <span class="text-right">{getMinutes(seconds)}</span>
  <span>:</span>
  <span class="w-4">{getSecondsRemaining(seconds)}</span>
</div>
