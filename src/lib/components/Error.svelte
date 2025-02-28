<script lang="ts">
  import Overlay from '$lib/components/Overlay.svelte'
  import Footer from '$lib/components/Footer.svelte'
  import Button from '$lib/components/Button.svelte'

  import { getSnapshotState } from '$lib/shared/stores/snapshot.svelte.js'

  import { AUTO_ADVANCE_MS } from '$lib/shared/constants.js'

  const { snapshot, send, error } = getSnapshotState()
</script>

<div class="absolute w-full h-full p-4 lg:p-8 bg-red text-white flex justify-center lg:text-lg">
  <Overlay>
    <div class="flex flex-col items-center gap-4">
      <h1 class="text-xl font-bold">Error!</h1>
      <div>{$error && $error.message}</div>
    </div>

    {#snippet footer()}
      <Footer>
        <Button
          timeout={AUTO_ADVANCE_MS}
          verb="reset"
          button={$snapshot.context.environment.getButton('submit')}
          onclick={() => send({ type: 'NEXT' })}
          >Reset
        </Button>
      </Footer>
    {/snippet}
  </Overlay>
</div>
