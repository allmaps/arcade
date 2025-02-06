<script lang="ts">
  import { formatTime } from '$lib/shared/format.js'

  type Props = {
    milliseconds: number
  }

  let { milliseconds }: Props = $props()

  const { minutes, seconds } = $derived(formatTime(milliseconds))
</script>

<div class="flex items-center gap-0.5">
  <span class="text-right">{minutes}</span>
  <span>:</span>
  <span class="w-4">{seconds}</span>
</div>
