<script lang="ts">
  import { page } from '$app/stores'

  // http://localhost:5173/share?maps=42eab2d08ca815cd,c2abd092a8c71881,500fccb573a1ca22,045d14eea64fef36,817f4ce19df88bc2

  const mapsParam = $page.url.searchParams.get('maps') || ''

  const mapIds = mapsParam?.split(',')
</script>

<ol>
  {#each mapIds as mapId}
    <li>{mapId}</li>
  {/each}
</ol>
