<script lang="ts">
  import Overlay from '$lib/components/Overlay.svelte'
  import Footer from '$lib/components/Footer.svelte'
  import Button from '$lib/components/Button.svelte'

  import { actor, error } from '$lib/shared/machines/game.js'
  import { environment } from '$lib/shared/stores/environment.js'

  import { AUTO_ADVANCE_MS } from '$lib/shared/constants.js'
</script>

<div class="absolute w-full h-full p-4 lg:p-8 bg-red text-white flex justify-center lg:text-lg">
  <Overlay>
    <div class="flex flex-col items-center gap-4">
      <h1 class="text-xl font-bold">Error!</h1>
      <div>{$error && $error.message}</div>
    </div>

    <Footer slot="footer">
      <Button
        timeout={AUTO_ADVANCE_MS}
        verb="reset"
        button={$environment.getButton('submit')}
        on:click={() => actor.send({ type: 'NEXT' })}
        >Reset
      </Button>
    </Footer>
  </Overlay>
</div>
