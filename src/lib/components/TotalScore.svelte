<script lang="ts">
  import { score, configuration } from '$lib/shared/machines/game.js'

  import { formatScore } from '$lib/shared/format'
</script>

<div class="rounded-full bg-white text-2xl font-bold px-4 py-2">
  Total points: {formatScore($configuration, $score)}
</div>
