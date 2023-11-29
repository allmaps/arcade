<script lang="ts">
  import { page } from '$app/stores'
  import { browser } from '$app/environment'

  let mapIds: string[] = []

  // http://localhost:5173/share?maps=42eab2d08ca815cd,c2abd092a8c71881,500fccb573a1ca22,045d14eea64fef36,817f4ce19df88bc2

  if (browser) {
    const mapsParam = $page.url.searchParams.get('maps') || ''
    mapIds = mapsParam?.split(',')
  }
</script>

<ol>
  {#each mapIds as mapId}
    <li>{mapId}</li>
  {/each}
</ol>
