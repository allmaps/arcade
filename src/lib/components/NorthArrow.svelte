<script lang="ts">
  import { GcpTransformer } from '@allmaps/transform'
  import { computeBbox } from '@allmaps/stdlib'

  import computeBearing from '@turf/bearing'

  import { getSnapshotState } from '$lib/shared/stores/snapshot.svelte.js'

  const { snapshot, currentRound } = getSnapshotState()

  let bearing = $derived.by(() => {
    if (currentRound && currentRound.loaded) {
      const transformer = new GcpTransformer(currentRound.map.gcps)

      const bbox = computeBbox(currentRound.map.resourceMask)

      const topLeft = transformer.transformToGeo([bbox[0], bbox[1]])
      const bottomLeft = transformer.transformToGeo([bbox[0], bbox[3]])

      return -computeBearing(bottomLeft, topLeft)
    }

    return 0
  })
  let rotation = $derived.by(() => {
    if ($snapshot.matches('round.display.image')) {
      return bearing
    } else if ($snapshot.matches('round.display.map')) {
      return 0
    }
  })
</script>

<div class="w-12 md:w-14 rounded-full shadow-md">
  <svg xmlns="http://www.w3.org/2000/svg" style="--rotation: {rotation}deg;" viewBox="0 0 800 800">
    <circle class="fill-white" cx="400" cy="400" r="400" />

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
