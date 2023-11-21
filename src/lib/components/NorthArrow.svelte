<script lang="ts">
  import { GCPTransformer } from '@allmaps/transform'
  import { computeBBox } from '@allmaps/stdlib'

  import computeBearing from '@turf/bearing'

  import { gameService, currentRound } from '$lib/shared/machines/game.js'

  let bearing = 0
  let rotation = 0

  $: {
    if ($gameService.matches('round.display.image')) {
      rotation = bearing
    } else if ($gameService.matches('round.display.map')) {
      rotation = 0
    }
  }

  $: {
    if ($currentRound && $currentRound.loaded) {
      const transformer = new GCPTransformer($currentRound.map.gcps)

      const bbox = computeBBox($currentRound.map.resourceMask)

      const topLeft = transformer.toGeo([bbox[0], bbox[1]])
      const bottomLeft = transformer.toGeo([bbox[0], bbox[3]])

      bearing = -computeBearing(bottomLeft, topLeft)
    }
  }
</script>

<div class="w-16">
  <svg xmlns="http://www.w3.org/2000/svg" style="--rotation: {rotation}deg;" viewBox="0 0 800 800">
    <circle class="fill-white" cx="400" cy="400.1" r="400" />

    <path class=" fill-red-500" d="M310.3,400L400,79l89.7,321" />
    <path class=" fill-gray-400" d="M489.7,400L400,721l-89.7-321" />
  </svg>
</div>

<style scoped>
  svg {
    transition: transform 0.1s ease-in-out;
    transform: rotate(var(--rotation));
  }
</style>
