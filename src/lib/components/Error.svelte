<script lang="ts">
  import Footer from '$lib/components/Footer.svelte'
  import Button from '$lib/components/Button.svelte'

  import { actor, error } from '$lib/shared/machines/game.js'
  import { environment } from '$lib/shared/stores/environment.js'

  import { AUTO_ADVANCE_MS } from '$lib/shared/constants.js'
</script>

<div class="w-full h-full flex flex-col items-center justify-center gap-4 bg-red">
  <h1 class="text-xl font-bold">Error!</h1>
  <div>{$error && $error.message}</div>
</div>

<Footer>
  <Button
    timeout={AUTO_ADVANCE_MS}
    verb="reset"
    button={$environment.getButton('submit')}
    on:click={() => actor.send({ type: 'NEXT' })}
    >Reset
  </Button>
</Footer>
