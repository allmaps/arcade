<script lang="ts">
  import { parseAnnotation } from '@allmaps/annotation'
  import { fetchJson, fetchImageInfo } from '@allmaps/stdlib'

  import { annotationUrls } from '$lib/shared/stores/annotations.js'

  import Thumbnail from '$lib/components/Thumbnail.svelte'

  function getMapId(annotationUrl: string) {
    const match = annotationUrl.match(/\/(?<mapId>\w+).json$/)
    return match?.groups?.mapId
  }

  function getImageId(imageUri: string) {
    const match = imageUri.match(/\/(?<imageId>\w+)$/)
    return match?.groups?.imageId
  }

  function getApiAnnotationUrl(annotationUrl: string) {
    const mapId = getMapId(annotationUrl)
    return `https://annotations.allmaps.org/maps/${mapId}`
  }

  function getDomain(url: string) {
    return new URL(url).hostname
  }
</script>

<ul class="images">
  {#each $annotationUrls as annotationUrl}
    <li class="relative">
      {#await fetchJson(annotationUrl)}
        <div>Loading</div>
      {:then annotation}
        {#await parseAnnotation(annotation) then maps}
          {#await fetchImageInfo(maps[0].resource.id)}
            <div>Loading</div>
          {:then imageInfo}
            <Thumbnail {imageInfo} width={400} height={400} />

            <div class="absolute top-0 p-2 text-sm">
              <ol class="list-none">
                <li>
                  Map ID: <a class="underline" href={annotationUrl}
                    ><strong>{getMapId(annotationUrl)}</strong></a
                  >
                </li>
                <li>
                  Image ID: <a class="underline" href={maps[0].resource.id}
                    ><strong>{getImageId(maps[0].resource.id)}</strong></a
                  >
                </li>

                {#await fetchJson(getApiAnnotationUrl(annotationUrl)) then apiAnnotation}
                  {#await parseAnnotation(apiAnnotation) then apiMaps}
                    <li>Domain: <strong>{getDomain(apiMaps[0].resource.id)}</strong></li>
                    <li>
                      <a
                        class="underline"
                        href="https://viewer.allmaps.org/?url={getApiAnnotationUrl(annotationUrl)}"
                        >Open in Allmaps Viewer</a
                      >
                    </li>
                    <li>
                      <a
                        class="underline"
                        href="https://editor.allmaps.org/#/collection?url={apiMaps[0].resource
                          .id}/info.json">Open in Allmaps Editor</a
                      >
                    </li>
                  {/await}
                {/await}
              </ol>
            </div>
          {/await}
        {/await}
      {/await}
    </li>
  {/each}
</ul>

<style scoped>
  .images {
    list-style-type: none;
    display: grid;

    gap: 10px;
    margin: 10px;

    /* From:
      https://css-tricks.com/an-auto-filling-css-grid-with-max-columns/
    */

    --grid-layout-gap: 10px;
    --grid-column-count: 5;
    --grid-item--min-width: 180px;

    --gap-count: calc(var(--grid-column-count) - 1);
    --total-gap-width: calc(var(--gap-count) * var(--grid-layout-gap));
    --grid-item--max-width: calc((100% - var(--total-gap-width)) / var(--grid-column-count));

    grid-template-columns: repeat(
      auto-fill,
      minmax(max(var(--grid-item--min-width), var(--grid-item--max-width)), 1fr)
    );
  }

  .images > li {
    position: relative;
    aspect-ratio: 1 / 1;
    border-radius: 5px;
    overflow: hidden;
  }
</style>
