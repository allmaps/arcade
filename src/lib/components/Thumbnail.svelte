<script lang="ts">
  // TODO: move to @allmaps/ui

  import { onMount } from 'svelte'

  import { Image, type ImageRequest } from '@allmaps/iiif-parser'

  export let imageInfo: unknown
  export let width: number
  export let height: number

  let parsedImage: Image

  let thumbnail: ImageRequest | ImageRequest[][]
  let tileCount = 1

  let tilesWidth = 0
  let tilesHeight = 0
  let columnPercentages: number[] = []

  onMount(() => {
    parsedImage = Image.parse(imageInfo)
    thumbnail = parsedImage.getThumbnail({ width, height }, 'cover')

    if (Array.isArray(thumbnail)) {
      const firstRow = thumbnail[0]

      tileCount = thumbnail.flat().length

      if (tileCount === 1) {
        thumbnail = firstRow[0]
      } else {
        tilesWidth = firstRow.reduce((acc, row) => acc + (row?.size?.width || 0), 0)
        tilesHeight = thumbnail.reduce(
          (acc, cells) => acc + (cells[0]?.size?.height || cells[0]?.size?.width || 0),
          0
        )
        columnPercentages = firstRow.map(
          (row) => ((row?.size?.width || 0) / (tilesWidth || 1)) * 100
        )
      }
    }
  })
</script>

{#if Array.isArray(thumbnail)}
  <div
    class="grid relative h-full object-cover"
    style:grid-template-columns={columnPercentages.map((percentage) => `${percentage}%`).join(' ')}
    style:aspect-ratio={`${tilesWidth} / ${tilesHeight}`}
    style:left={`${(100 - (tilesWidth / tilesHeight) * 100) / 2}%`}
  >
    {#each thumbnail as row, rowIndex (rowIndex)}
      {#each row as tile, columnIndex (columnIndex)}
        <img alt={`Thumbnail for ${parsedImage.uri}`} src={parsedImage.getImageUrl(tile)} />
      {/each}
    {/each}
  </div>
{:else if thumbnail !== undefined}
  <img
    class="w-full h-full object-cover"
    alt={`Thumbnail for ${parsedImage.uri}`}
    src={parsedImage.getImageUrl(thumbnail)}
  />
{:else}
  <div class="w-full h-full bg-gray-200" />
{/if}
