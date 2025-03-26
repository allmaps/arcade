<script lang="ts">
  import { generateRandomId } from '@allmaps/id'

  import Footer from '$lib/components/Footer.svelte'
  import Button from '$lib/components/Button.svelte'
  import NameInput from '$lib/components/NameInput.svelte'

  import { getSnapshotState } from '$lib/shared/stores/snapshot.svelte.js'

  import Overlay from '$lib/components/Overlay.svelte'
  import BackspaceIcon from '$lib/components/BackspaceIcon.svelte'

  const { snapshot, send, lastHighscore, totalScore } = getSnapshotState()

  let nameInput: NameInput

  let name = $state($lastHighscore?.name || '')

  async function handleSubmit() {
    send({
      type: 'SUBMIT_HIGHSCORE',
      highscore: {
        id: await generateRandomId(),
        name,
        score: $totalScore,
        date: new Date()
      }
    })
  }
</script>

<div
  class="absolute w-full h-full p-4 lg:p-8 bg-orange text-white flex flex-col items-center gap-8 justify-center lg:text-lg"
>
  <h1 class="text-3xl lg:text-5xl">Enter your name:</h1>
  <div>
    <NameInput bind:this={nameInput} bind:value={name} onsubmit={handleSubmit} />
  </div>

  <Overlay>
    {#snippet footer()}
      <Footer>
        {#snippet buttons()}
          <Button
            button={$snapshot.context.environment.getButton('toggle')}
            verb="delete last character"
            onclick={() => nameInput.backspace()}
          >
            <BackspaceIcon />
          </Button>
        {/snippet}
        <Button
          button={$snapshot.context.environment.getButton('submit')}
          disabled={name.length < 1}
          verb="submit name"
          onclick={() => handleSubmit()}>Submit</Button
        >
      </Footer>
    {/snippet}
  </Overlay>
</div>
