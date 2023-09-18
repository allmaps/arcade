<script lang="ts">
  import Footer from '$lib/components/Footer.svelte'
  import Button from '$lib/components/Button.svelte'
  import ArcadeButtonIcon from '$lib/components/ArcadeButtonIcon.svelte'

  import { gameService } from '$lib/shared/stores/game.js'
</script>

Explain game here!

<Footer>
  <Button timeout={6000} on:click={() => gameService.send('NEXT')}
    >Press <ArcadeButtonIcon bgClass="bg-white" /> to start</Button
  >
</Footer>
