<script lang="ts">
  import Footer from '$lib/components/Footer.svelte'
  import Button from '$lib/components/Button.svelte'
  import ArcadeButtonIcon from '$lib/components/ArcadeButtonIcon.svelte'

  import { gameService } from '$lib/shared/machines/game.js'
  import { environment } from '$lib/shared/stores/environment.js'

  import { AUTO_ADVANCE_MS } from '$lib/shared/constants.js'
</script>

<ol>
  <li>Explain game here!</li>
  <li>5 rounds</li>
  <li>You can always view the image</li>
  <li>Faster & closer = better!</li>
  <li>Score, large scale maps more points</li>
  <li>Keyboard shortcuts!</li>
</ol>

<Footer>
  <Button
    timeout={AUTO_ADVANCE_MS}
    keyCode={$environment.getButton(0).keyCode}
    on:click={() => gameService.send('NEXT')}
    >Start <ArcadeButtonIcon button={$environment.getButton(0)} /></Button
  >
</Footer>
