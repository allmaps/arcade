<script lang="ts">
  import { getMapControlsState } from '$lib/shared/stores/map-controls.svelte.js'

  const mapControlsState = getMapControlsState()
  const rotation = $derived(-mapControlsState.bearing)
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
