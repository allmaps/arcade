<script lang="ts">
  import { score, configuration } from '$lib/shared/machines/game.js'

  import { formatScore } from '$lib/shared/format'
</script>

<div
  class="rounded-full shadow-md bg-white text-lg md:text-xl lg:text-2xl px-4 py-2 md:px-6 md:py-3 lg:px-8 lg:py-4"
>
  Total score: <span class="font-bold">{formatScore($configuration, $score)} points</span>
</div>
