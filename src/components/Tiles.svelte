<div class="tiles"
  style="grid-template-columns: repeat({size}, 1fr); grid-template-rows: repeat({size}, 1fr);">
	{#each Array.from({length: size * size}, (_, index) => ({ index })) as tile}
		<div>
      {#if parsedImage && tick >= tile.index}
        <img alt="{`${tile.index}`}" src="{getImageUrl(parsedImage, {region: tiles[tile.index]})}" />
      {/if}
    </div>
	{/each}
</div>