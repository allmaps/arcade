<script lang="ts">
  import { darkblue, purple, pink, orange, yellow, green, blue } from '@allmaps/tailwind'

  const colors = [darkblue, purple, pink, orange, yellow, green, blue]

  const colorHeight = 150
  const count = colors.length * 4
  const height = colorHeight * count

  const fromY = 3500
  const toY = fromY - colors.length * colorHeight
</script>

<svg viewBox={`0 0 1376.4 ${height}`} style="--fromY: {fromY}px; --toY: {toY}px;">
  <g id="diamonds">
    {#each Array.from({ length: count }) as _, index}
      <g transform={`translate(0 -${index * colorHeight})`}>
        <polygon
          fill={colors[index % colors.length]}
          points="688.2,0 0,406.4 688.2,812.7 1376.4,406.3 "
        />
      </g>
    {/each}
  </g>
</svg>

<style scoped>
  #diamonds {
    animation: translate linear reverse 15s infinite;
    transform-origin: center center;

    scale: 1.5;
  }

  @keyframes translate {
    0% {
      transform: translate(0, var(--fromY));
    }

    100% {
      transform: translate(0, var(--toY));
    }
  }
</style>
