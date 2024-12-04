<script lang="ts">
  import { generateRandomId } from '@allmaps/id'

  import Footer from '$lib/components/Footer.svelte'
  import Button from '$lib/components/Button.svelte'
  import NameInput from '$lib/components/NameInput.svelte'

  import { actor, configuration, lastHighscore, totalScore } from '$lib/shared/machines/game.js'

  import { environment } from '$lib/shared/stores/environment.js'
  import { formatScore } from '$lib/shared/format'

  import Overlay from '$lib/components/Overlay.svelte'
  import BackspaceIcon from '$lib/components/BackspaceIcon.svelte'

  let nameInput: NameInput

  let name = $lastHighscore?.name || ''

  async function handleSubmit() {
    actor.send({
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
    <NameInput bind:this={nameInput} bind:value={name} on:submit={handleSubmit} />
  </div>

  <Overlay>
    <Footer slot="footer">
      <Button
        slot="buttons"
        button={$environment.getButton('toggle')}
        verb="delete last character"
        on:click={() => nameInput.backspace()}
      >
        <BackspaceIcon />
      </Button>
      <Button
        button={$environment.getButton('submit')}
        disabled={name.length < 1}
        verb="submit name"
        on:click={handleSubmit}>Submit</Button
      >
    </Footer>
  </Overlay>
</div>
