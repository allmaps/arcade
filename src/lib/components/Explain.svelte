<script lang="ts">
  import Footer from '$lib/components/Footer.svelte'
  import Button from '$lib/components/Button.svelte'
  import ArcadeButtonIcon from '$lib/components/ArcadeButtonIcon.svelte'

  import { gameService } from '$lib/shared/machines/game.js'
  import { environment } from '$lib/shared/stores/environment.js'

  import { AUTO_ADVANCE_MS } from '$lib/shared/constants.js'
</script>

<div class="absolute w-full h-full flex flex-col items-center justify-center bg-green">
  <ol>
    <li>Welcome to Allmaps Arcade!</li>
    <li>5 rounds</li>
    <li>
      You can always view the image again by pressing <ArcadeButtonIcon
        button={$environment.getButton('toggle')}
      />
    </li>
    <li>
      Zoom in and out with <ArcadeButtonIcon button={$environment.getButton('zoomIn')} /> and <ArcadeButtonIcon
        button={$environment.getButton('zoomOut')}
      />
    </li>
    <li>
      Press <ArcadeButtonIcon button={$environment.getButton('submit')} /> if you have found the right
      location. The faster & closer you are, the more points you'll earn.
    </li>
    <li>Score, large scale maps more points</li>
    <li>Keyboard shortcuts!</li>
    <li>Visit allmaps.org</li>
  </ol>
</div>

<Footer>
  <Button
    timeout={AUTO_ADVANCE_MS}
    button={$environment.getButton('submit')}
    on:click={() => gameService.send('NEXT')}
    >Start <ArcadeButtonIcon button={$environment.getButton('submit')} /></Button
  >
</Footer>
