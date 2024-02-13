<script lang="ts">
  import { score, configuration } from '$lib/shared/machines/game.js'

  import { formatScore } from '$lib/shared/format'
</script>

<div class="rounded-full shadow-md bg-white text-2xl px-8 py-4">
  Total score: <span class="font-bold">{formatScore($configuration, $score)} points</span>
</div>
