<script lang="ts">
  import Footer from '$lib/components/Footer.svelte'
  import Button from '$lib/components/Button.svelte'
  import ArcadeButtonIcon from '$lib/components/ArcadeButtonIcon.svelte'

  import { gameService, error } from '$lib/shared/machines/game.js'

  import { BUTTON_1, AUTO_ADVANCE } from '$lib/shared/constants.js'
</script>

<div>Error!</div>
<div>{$error && $error.message}</div>

<Footer>
  <Button timeout={AUTO_ADVANCE} shortcutKey={BUTTON_1} on:click={() => gameService.send('NEXT')}
    >Press <ArcadeButtonIcon bgClass="bg-white" /> to reset</Button
  >
</Footer>
