<script lang="ts">
  import { getSnapshotState } from '$lib/shared/stores/snapshot.svelte.js'
  import { getTimerState } from '$lib/shared/stores/timer.svelte.js'

  import HeaderItem from '$lib/components/HeaderItem.svelte'
  import Time from '$lib/components/Time.svelte'

  const { currentRound } = getSnapshotState()
  const timerState = getTimerState()

  const diffTime = $derived(
    $currentRound?.loaded ? Math.max(timerState.endTime - $currentRound.startTime, 0) : 0
  )
</script>

<HeaderItem>
  <Time milliseconds={diffTime} />
</HeaderItem>
