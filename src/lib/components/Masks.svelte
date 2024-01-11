<script lang="ts">
  const masks = [
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
      fillOpacity: 0.5256,
      stroke: '#64C18F'
    }
  ]

  function pointsToPath(points: number[][], length?: number) {
    if (!length) {
      length = points.length
    }

    return points
      .slice(0, length)
      .map((point, index) => [
        index === 0 ? 'M' : 'L',
        ...point,
        index === points.length - 1 ? 'Z' : ''
      ])
      .flat()
      .join(' ')
  }

  const mask = masks[0]

  const matrix = [
    // scaleX,
    // scaleX,
    // scaleY,
    // scaleY,
    -100, //translateX,
    50 //translateY,
  ]

  // const point = new DOMPoint(5, 4);
  // const scaleX = 2;
  // const scaleY = 3;
  // const translateX = 12;
  // const translateY = 8;
  // const angle = Math.PI / 2;
  // const matrix = new DOMMatrix([
  //   Math.cos(angle) * scaleX,
  //   Math.sin(angle) * scaleX,
  //   -Math.sin(angle) * scaleY,
  //   Math.cos(angle) * scaleY,
  //   translateX,
  //   translateY,
  // ]);
  // const transformedPoint = point.matrixTransform(matrix);
</script>

<svg xmlns="http://www.w3.org/2000/svg" version="1.1" viewBox="0 0 1600 1381">
  <path id="p1" d={pointsToPath(mask.points)} stroke="blue" fill="none" stroke-width="4" />
  <animate
    xlink:href="#p1"
    attributeName="d"
    attributeType="XML"
    from={pointsToPath(masks[0].points)}
    to={pointsToPath(masks[1].points)}
    dur="10s"
    fill="freeze"
  />
</svg>

<svg
  class="background pointer-events-none"
  id="masks"
  version="1.1"
  xmlns="http://www.w3.org/2000/svg"
  xmlns:xlink="http://www.w3.org/1999/xlink"
  preserveAspectRatio="xMinYMin slice"
  x="0px"
  y="0px"
  viewBox="0 0 1600 1381"
>
  <path
    id="mask"
    d={pointsToPath(mask.points)}
    style:fill={mask.fill}
    style:fill-opacity={mask.fillOpacity}
    style:stroke={mask.stroke}
  />
  <!--
  <path
  id="mask-{index}"
  d={pointsToPath(mask.points)}
  style:fill={mask.fill}
  style:fill-opacity={mask.fillOpacity}
  style:stroke={mask.stroke}
/>
{#if animationStep === 'dragging' && draggingMaskIndex === index}
  <animate
    bind:this={draggingAnimatePoints}
    xlink:href="#mask"
    attributeName="d"
    attributeType="XML"
    from={pointsToPath(mask.points)}
    to={pointsToPath(newMaskPoints)}
    dur={`${5}s`}
    fill="freeze"
  /> -->
</svg>
