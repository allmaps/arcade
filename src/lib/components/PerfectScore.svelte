<script lang="ts">
  import { coordinatesToSvgPath } from '$lib/shared/geometry.js'
  import { colorForRounds } from '$lib/shared/colors.js'

  import type { Point } from '@allmaps/types'

  export let color: string
  export let width: number
  export let height: number
  export let coordinates: Point[]

  const triangleCount = 11

  const anglePerColor = 360 / (triangleCount * 2)

  function svgPointFromAngle(angleInDegrees: number) {
    const radius = width + height
    const angleInRadians = (angleInDegrees * Math.PI) / 180
    const x = Math.cos(angleInRadians) * radius + width / 2
    const y = Math.sin(angleInRadians) * radius + height / 2
    return `${x},${y}`
  }
</script>

<div class="absolute top-0 left-0 w-full h-full pointer-events-none">
  <svg viewBox={`0 0 ${width} ${height}`}>
    <defs>
      <path
        d="M 0 0 H {width} V {height} H {0} L 0 0 {coordinatesToSvgPath(coordinates)}"
        id="outside"
      />
    </defs>
    <clipPath id="only-outside">
      <use href="#outside" clip-rule="evenodd" />
    </clipPath>

    <g clip-path="url(#only-outside)">
      <g transform-origin="center" opacity="0.9">
        {#each Array.from({ length: triangleCount * 2 }) as _, index}
          <polygon
            fill={index % 2 === 0 ? color : 'none'}
            points="{width / 2},{height / 2} {svgPointFromAngle(
              anglePerColor * index
            )} {svgPointFromAngle(anglePerColor * (index + 1))}"
          />
        {/each}

        <animateTransform
          attributeName="transform"
          attributeType="XML"
          type="rotate"
          from="0 0 0"
          to="360 0 0"
          dur="5s"
          repeatCount="indefinite"
        />
      </g>
    </g>
  </svg>
</div>
