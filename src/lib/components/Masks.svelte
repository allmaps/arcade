<script lang="ts">
  import { onMount } from 'svelte'
  import { quintOut } from 'svelte/easing'

  import { pointsToPath } from '$lib/shared/svg.js'

  type Mask = {
    points: [number, number][]
    bgClass: string
    fill: string
    fillOpacity: number
    stroke: string
  }

  type Direction = 'up' | 'down' | 'left' | 'right'

  const masks: Mask[] = [
    {
      points: [
        [1028.3, 975.1],
        [624.5, 1017.6],
        [659.3, 1341.3],
        [956.4, 1310.1],
        [945, 1201.2],
        [1051.7, 1190]
      ],
      fill: '#A5DFE6',
      bgClass: 'bg-red',
      fillOpacity: 0.3873,
      stroke: '#63D8E6'
    },
    {
      points: [
        [1457.1, 459],
        [921.5, 305.9],
        [997.5, 39],
        [1284.9, 120.7],
        [1254.9, 226.1],
        [1503.1, 297.5]
      ],
      fill: '#FE5E60',
      bgClass: 'bg-yellow',
      fillOpacity: 0.2548,
      stroke: '#FE5E60'
    },
    {
      points: [
        [178.7, 142.9],
        [375.3, 114],
        [602.3, 73.3],
        [678.9, 56.4],
        [698.6, 164.9],
        [624.8, 183.3],
        [653.5, 375],
        [167.5, 463.5],
        [144.5, 284.5],
        [196.5, 273.5]
      ],
      fill: '#ffc742',
      bgClass: 'bg-darkblue',
      fillOpacity: 0.3361,
      stroke: '#ffc742'
    },
    {
      points: [
        [483.8, 640],
        [419.3, 875.1],
        [478.6, 893.4],
        [488.9, 942.8],
        [484.1, 998.5],
        [465.1, 1056.6],
        [431.7, 1110.7],
        [401.4, 1146.2],
        [83.4, 1056.1],
        [223.6, 565.6]
      ],
      fill: '#C552B5',
      bgClass: 'bg-pink',
      fillOpacity: 0.5033,
      stroke: '#C552B5'
    },
    {
      points: [
        [1097.7, 572],
        [1446.1, 571.9],
        [1446.1, 856],
        [1295.3, 856],
        [1295.3, 784.1],
        [1183.3, 774.9],
        [1173.3, 855.5],
        [1097.1, 855.5]
      ],
      fill: '#64C18F',
      bgClass: 'bg-orange',
      fillOpacity: 0.5256,
      stroke: '#64C18F'
    }
  ]

  type Directions = Record<
    Direction,
    {
      in: Direction
      out: Direction
    }
  >

  const directions: Directions = {
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

  let intervalId: number | undefined

  let keyDirection: Direction | undefined
  let resetKeyDirectionOnNextTick = false

  let maskIndex = 0
  let direction = directions.left

  function tick() {
    maskIndex = (maskIndex + Math.ceil(Math.random() * (masks.length - 1))) % masks.length

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
    intervalId = setInterval(tick, 4000)
    tick()
  }

  function handleKeydown(event: KeyboardEvent) {
    let newKeyDirection: Direction | undefined

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

  function slide(
    node: Element,
    { delay = 0, duration = 400, easing = quintOut, direction = 'left' }
  ) {
    let css = (t: number) => `transform: translateX(-${(1 - t) * 100}%);`

    if (direction === 'right') {
      css = (t: number) => `transform: translateX(${(1 - t) * 100}%);`
    } else if (direction === 'down') {
      css = (t: number) => `transform: translateY(${(1 - t) * 100}%);`
    } else if (direction === 'up') {
      css = (t: number) => `transform: translateY(-${(1 - t) * 100}%);`
    }

    return {
      delay,
      duration,
      easing,
      css
    }
  }

  function zoom(node: Element, { delay = 0, duration = 400, easing = quintOut }) {
    return {
      delay,
      duration,
      easing,
      css: (t: number) => `scale: ${1 - (1 - t) * 0.25};`
    }
  }

  onMount(() => {
    resetInterval()

    return () => clearInterval(intervalId)
  })
</script>

<svelte:document on:keydown={handleKeydown} on:keyup={handleKeyup} />

<div class="w-full h-full relative">
  {#key maskIndex}
    <div
      class="absolute top-0 w-full h-full overflow-hidden p-28 {masks[maskIndex].bgClass}"
      in:slide={{ duration: 1500, direction: direction.in }}
      out:slide={{ duration: 1500, direction: direction.out }}
    >
      <svg
        in:zoom={{ delay: 1500, duration: 1500 }}
        xmlns="http://www.w3.org/2000/svg"
        version="1.1"
        viewBox="-2 -2 104 104"
      >
        <path
          id="p0"
          stroke={masks[maskIndex].stroke}
          fill="none"
          stroke-width="4"
          d={pointsToPath(masks[maskIndex].points, [100, 100])}
        />
      </svg>
    </div>
  {/key}
</div>
