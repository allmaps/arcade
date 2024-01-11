<script lang="ts">
  import { formatTime } from '$lib/shared/format.js'

  export let milliseconds: number

  let minutes = ''
  let seconds = ''
  $: {
    ;({ minutes, seconds } = formatTime(milliseconds))
  }
</script>

<div class="flex items-center gap-0.5">
  <span class="text-right">{minutes}</span>
  <span>:</span>
  <span class="w-4">{seconds}</span>
</div>
