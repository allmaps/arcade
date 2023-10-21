<script lang="ts">
  import { gameService } from '$lib/shared/machines/game.js'

  import Footer from '$lib/components/Footer.svelte'
  import Button from '$lib/components/Button.svelte'
  import ArcadeButtonIcon from '$lib/components/ArcadeButtonIcon.svelte'

  import { BUTTON_1 } from '$lib/shared/constants.js'
</script>

<div>Highscores</div>

<Footer>
  <Button shortcutKey={BUTTON_1} on:click={() => gameService.send('NEXT')}
    >Next <ArcadeButtonIcon bgClass="bg-white" />
  </Button>
</Footer>
