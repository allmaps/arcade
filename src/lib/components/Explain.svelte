<script lang="ts">
  import Footer from '$lib/components/Footer.svelte'
  import Button from '$lib/components/Button.svelte'
  import ArcadeButtonIcon from '$lib/components/ArcadeButtonIcon.svelte'

  import { gameService } from '$lib/shared/machines/game.js'
  import { environment } from '$lib/shared/stores/environment.js'

  import { AUTO_ADVANCE_MS } from '$lib/shared/constants.js'
</script>

<div class="absolute w-full h-full flex flex-col items-center justify-center p-4 gap-8 bg-green">
  <h2>Welcome to Allmaps Arcade!</h2>
  <ol class="grid">
    <li>Historic map</li>
    <li>Move mask on map</li>
    <li>Find correct location</li>
  </ol>

  <ul>
    <li>5 rounds</li>
    <li>
      You can always view the image again by pressing <ArcadeButtonIcon
        button={$environment.getButton('toggle')}
      />
    </li>
    <li>
      Move the map with the arrow keys, zoom in and out with <ArcadeButtonIcon
        button={$environment.getButton('zoomIn')}
      /> and <ArcadeButtonIcon button={$environment.getButton('zoomOut')} />
    </li>
    <li>
      Press <ArcadeButtonIcon button={$environment.getButton('submit')} /> if you have found the right
      location. The faster & closer you are, the more points you'll earn. Score, large scale maps more
      points
    </li>
    <li>Visit allmaps.org</li>
  </ul>
</div>

<Footer>
  <Button
    timeout={AUTO_ADVANCE_MS}
    button={$environment.getButton('submit')}
    verb="start playing"
    on:click={() => gameService.send('NEXT')}>Start playing</Button
  >
</Footer>
