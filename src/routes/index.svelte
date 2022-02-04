<script>
  import { onMount, onDestroy } from 'svelte'

  import Map from '../components/Map.svelte'

  import { parse as parseAnnotation } from '@allmaps/annotation'
  import { parseIiif, getImageUrl, getThumbnail } from  '@allmaps/iiif-parser'

  // const annotationUrl = 'https://annotations.allmaps.org/maps/NPYaLJ6K51DB9TDi'
  // const annotationUrl = 'https://annotations.allmaps.org/maps/SF6xpFZMdYrkPfwr'
  // const annotationUrl = 'https://annotations.allmaps.org/maps/8vBFvvynRcw6WjtK'
  // const annotationUrl = 'https://annotations.allmaps.org/maps/2VbSJufBwxEwpkaS'
  const annotationUrl = 'https://annotations.allmaps.org/maps/KrAgjhryYkPKGMP3'

  const size = 3
  const maxDepth = 3

  let tickSpeed = 2000

  let interval
  let tick = 0
  let currentDepth = maxDepth

  let georef
  let parsedImage
  let tiles = []

  async function fetchJson (url) {
    const response = await fetch(url)
    const json = await response.json()
    return json
  }

  async function fetchImage (imageUri) {
    const image = await fetchJson(`${imageUri}/info.json`)
    return image
  }

  function getPixelMaskBoundingBox (pixelMask) {
    let minX = Infinity
    let minY = Infinity
    let maxX = -Infinity
    let maxY = -Infinity

    for (let [x, y] of pixelMask) {
      if (x < minX) {
        minX = x
      }

      if (y < minY) {
        minY = y
      }

      if (x > maxX) {
        maxX = x
      }

      if (y > maxY) {
        maxY = y
      }
    }

    return [
      [minX, minY],
      [maxX, maxY]
    ]
  }

  function updateTick () {
    tick++

    if (tick === size * size) {
      currentDepth = (currentDepth - 1 + maxDepth) % maxDepth
    }

    tick = tick % (size * size)
  }

  onMount (async () => {
    const annotation = await fetchJson(annotationUrl)
    const georefs = parseAnnotation(annotation)

    // TODO: check length
    georef = georefs[0]
    const imageUri = georef.image.uri

    const image = await fetchImage(imageUri)
    parsedImage = parseIiif(image)

    const pixelMaskBoundingBox = getPixelMaskBoundingBox(georef.pixelMask)
    const pixelMaskWidth = pixelMaskBoundingBox[1][0] - pixelMaskBoundingBox[0][0]
    const pixelMaskHeight = pixelMaskBoundingBox[1][1] - pixelMaskBoundingBox[0][1]

    const selectionWidth = Math.min(pixelMaskWidth, pixelMaskHeight)

    const selectionMinX = pixelMaskBoundingBox[0][0] + ((selectionWidth < pixelMaskWidth) ? (pixelMaskWidth - selectionWidth) / 2 : 0)
    const selectionMinY = pixelMaskBoundingBox[0][1] + ((selectionWidth < pixelMaskHeight) ? (pixelMaskHeight - selectionWidth) / 2 : 0)

    const tileWidth = Math.floor(selectionWidth / size)

    console.log(georef.pixelMask, {
      selectionMinX,
      selectionMinY,
      selectionWidth
    })

    for (let y = 0; y < size; y++) {
      for (let x = 0; x < size; x++) {
        tiles.push({
          // x: Math.round(selectionMinX + (selectionWidth / size) * x),
          // y: Math.round(selectionMinY + (selectionWidth / size) * y),
          // width: Math.round(selectionWidth / size),
          // height: Math.round(selectionWidth / size)
          x: selectionMinX + tileWidth * x,
          y: selectionMinY + tileWidth * y,
          width: tileWidth,
          height: tileWidth
        })
      }
    }

    interval = setInterval(updateTick, tickSpeed)
  })

  onDestroy(() => {
    if (interval) {
      clearInterval(interval)
    }
  })

</script>

<div class="container">
  <div class="tiles"
  style="grid-template-columns: repeat({size}, 1fr); grid-template-rows: repeat({size}, 1fr);">
	{#each Array.from({length: size * size}, (_, index) => ({ index })) as tile}
		<div>
      {#if parsedImage}
        <img alt="{`${tile.index}`}"
          src="{getImageUrl(parsedImage, {region: tiles[tile.index]})}"
          class:visible="{tick >= tile.index}" />
      {/if}
    </div>
	{/each}
  </div>
  <div class="map">
    <Map georef={georef} tiles={tiles} tick={tick} />
  </div>
</div>

<style scoped>
:global(html, body, #svelte) {
  box-sizing: border-box;
  margin: 0;
  height: 100%;
}

:global(#svelte) {
  display: flex;
  align-items: center;
  justify-content: center;
}

.container {
  width: unset;
  height: 100%;

  aspect-ratio: 2 / 1;
  object-fit: contain;
  max-width: 100%;
  max-height: 100%;

  display: grid;
  grid-template-columns: repeat(2, 50%);
  grid-template-rows: 100%;
  /* gap: 5px 5px; */
  grid-template-areas:
    "tiles map";
  align-content: stretch;
  justify-items: stretch;
}

@media (max-aspect-ratio: 2 / 1) {
  .container {
    width: 100%;
    height: unset;
  }
}

@media (max-aspect-ratio: 1 / 1) {
  .container {
    width: inherit;
    height: 100%;

    aspect-ratio: 1 / 2;
    grid-template-columns: 100%;
    grid-template-rows: repeat(2, 50%);
    grid-template-areas:
      "tiles"
      "map";
  }
}

@media (max-aspect-ratio: 1 / 2) {
  .container {
    width: 100%;
    height: unset;
  }
}

.tiles {
  grid-area: tiles;

  display: grid;
  grid-auto-columns: 1fr;
  align-content: stretch;
  justify-items: stretch;
  width: 100%;
  height: 100%;
}

.tiles img {
  width: 100%;
  display: inherit;
  opacity: 0.1;
  transition: opacity 1s;
}

.tiles img.visible {
  opacity: 1;
}

.map {
  position: relative;
}
</style>
