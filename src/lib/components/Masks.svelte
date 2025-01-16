<script lang="ts">
  import { onMount } from 'svelte'

  import { slide, type SlideDirection } from '$lib/shared/transitions.js'

  import Mask from '$lib/components/Mask.svelte'

  import initialGeoMasks from '$lib/shared/initial-geo-masks.js'

  let intervalId: number | undefined
  const tickInterval = 4000

  const colorClasses = [
    {
      bg: 'bg-red',
      stroke: 'stroke-red'
    },
    {
      bg: 'bg-yellow',
      stroke: 'stroke-yellow'
    },
    {
      bg: 'bg-pink',
      stroke: 'stroke-pink'
    },
    {
      bg: 'bg-orange',
      stroke: 'stroke-orange'
    },
    {
      bg: 'bg-green',
      stroke: 'stroke-green'
    },
    {
      bg: 'bg-purple',
      stroke: 'stroke-purple'
    },
    {
      bg: 'bg-blue',
      stroke: 'stroke-blue'
    },
    {
      bg: 'bg-darkblue',
      stroke: 'stroke-darkblue'
    }
  ]

  type SlideDirections = Record<
    SlideDirection,
    {
      in: SlideDirection
      out: SlideDirection
    }
  >

  const directions: SlideDirections = {
    left: {
      in: 'left',
      out: 'right'
    },
    right: {
      in: 'right',
      out: 'left'
    },
    up: {
      in: 'up',
      out: 'down'
    },
    down: {
      in: 'down',
      out: 'up'
    }
  }

  const geoMasks = initialGeoMasks

  let keyDirection: SlideDirection | undefined
  let resetKeyDirectionOnNextTick = false

  let bgColorClassIndex = 0
  let strokeColorClassIndex = 1

  let geoMaskIndex = 0
  let direction = directions.left

  function tick() {
    geoMaskIndex =
      (geoMaskIndex + Math.ceil(Math.random() * (geoMasks.length - 1))) % geoMasks.length

    bgColorClassIndex =
      (bgColorClassIndex + Math.ceil(Math.random() * (colorClasses.length - 1))) %
      colorClasses.length

    strokeColorClassIndex =
      (bgColorClassIndex + Math.ceil(Math.random() * (colorClasses.length - 1))) %
      colorClasses.length

    if (!keyDirection) {
      direction =
        Object.values(directions)[Math.floor(Math.random() * Object.keys(directions).length)]
    } else {
      direction = directions[keyDirection]
    }

    if (resetKeyDirectionOnNextTick) {
      keyDirection = undefined
    }
  }

  function resetInterval() {
    clearInterval(intervalId)
    intervalId = setInterval(tick, tickInterval)
    tick()
  }

  function handleKeydown(event: KeyboardEvent) {
    let newKeyDirection: SlideDirection | undefined

    if (event.code === 'ArrowLeft') {
      newKeyDirection = 'left'
    } else if (event.code === 'ArrowRight') {
      newKeyDirection = 'right'
    } else if (event.code === 'ArrowUp') {
      newKeyDirection = 'up'
    } else if (event.code === 'ArrowDown') {
      newKeyDirection = 'down'
    }

    keyDirection = newKeyDirection

    if (newKeyDirection && !event.repeat) {
      resetInterval()
    }
  }

  function handleKeyup(event: KeyboardEvent) {
    if (event.code === 'ArrowLeft' && keyDirection === 'left') {
      resetKeyDirectionOnNextTick = true
    } else if (event.code === 'ArrowRight' && keyDirection === 'right') {
      resetKeyDirectionOnNextTick = true
    } else if (event.code === 'ArrowUp' && keyDirection === 'up') {
      resetKeyDirectionOnNextTick = true
    } else if (event.code === 'ArrowDown' && keyDirection === 'down') {
      resetKeyDirectionOnNextTick = true
    }
  }

  onMount(() => {
    resetInterval()
    return () => clearInterval(intervalId)
  })
</script>

<svelte:document on:keydown={handleKeydown} on:keyup={handleKeyup} />

<div class="w-full h-full relative">
  {#key geoMaskIndex}
    <div
      class="absolute top-0 w-full h-full overflow-hidden flex justify-center {colorClasses[
        bgColorClassIndex
      ].bg}"
      in:slide={{ duration: 1500, direction: direction.in }}
      out:slide={{ duration: 1500, direction: direction.out }}
    >
      <Mask
        geoMask={geoMasks[geoMaskIndex]}
        strokeClass={colorClasses[strokeColorClassIndex].stroke}
        tickInterval={tickInterval / 1.5}
      />
    </div>
  {/key}
</div>
