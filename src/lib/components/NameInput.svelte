<script lang="ts">
  import { onMount } from 'svelte'

  import { getGameTimeoutState } from '$lib/shared/stores/game-timeout.svelte.js'

  import { isCabinet } from '$lib/shared/cabinet.js'

  const gameTimeoutState = getGameTimeoutState()

  const HIGHSCORE_NAME_LENGTH = 5

  let inputList: HTMLOListElement
  let inputs: HTMLInputElement[] = []

  type Props = {
    value?: string
    onsubmit?: (value: string) => void
  }

  let { value = $bindable(''), onsubmit }: Props = $props()

  export function backspace(index?: number) {
    if (index === undefined) {
      const selectedInputIndex = getSelectedInputIndex()

      if (selectedInputIndex !== null) {
        index = selectedInputIndex
      } else {
        index = value.length
      }
    }

    if (index > value.length - 2) {
      const input = inputs[index]
      if (input) {
        input.value = ''
        selectAndFocusInput(index - 1)
      }
    } else if (index > 0) {
      for (const [replaceIndex, input] of [...inputs.entries()].slice(index)) {
        inputs[replaceIndex - 1].value = input.value
      }
      inputs[value.length - 1].value = ''
      selectAndFocusInput(index - 1)
    }

    update()
  }

  function update() {
    value = getName()

    for (const [index, input] of inputs.entries()) {
      if (index < value.length + 1) {
        input.disabled = false
      } else {
        input.disabled = true
      }
    }
  }

  function getName() {
    let name: string = ''

    for (const input of inputs) {
      if (input.value) {
        name += input.value
      } else {
        break
      }
    }

    return name.toUpperCase().trim()
  }

  function getSelectedInputIndex() {
    for (const [index, input] of inputs.entries()) {
      if (input === document.activeElement) {
        return index
      }
    }

    return null
  }

  function selectAndFocusInput(index: number) {
    const input = inputs[index]

    if (input && !input.disabled) {
      input.focus()
      input.select()
    }
  }

  function handleKeydown(index: number, event: KeyboardEvent) {
    gameTimeoutState.resetLastInteraction()

    if (event.key === 'Tab') {
      event.preventDefault()

      return
    }

    const input = event.target as HTMLInputElement

    if (event.key === 'Backspace') {
      event.preventDefault()

      backspace(index)

      return
    } else if (event.key === 'ArrowUp') {
      if (input) {
        if (input.value) {
          if (input.value === 'a' || input.value === 'A') {
            event.preventDefault()

            input.value = 'Z'
          } else {
            event.preventDefault()

            const previousCharCode = input.value.charCodeAt(0) - 1
            const previousValue = String.fromCharCode(previousCharCode)
            input.value = previousValue
          }
        } else {
          event.preventDefault()

          input.value = 'Z'
        }
      }
    } else if (event.key === 'ArrowDown') {
      if (input) {
        if (input.value) {
          if (input.value === 'z' || input.value === 'Z') {
            event.preventDefault()

            input.value = 'A'
          } else {
            event.preventDefault()

            const nextCharCode = input.value.charCodeAt(0) + 1
            const nextValue = String.fromCharCode(nextCharCode)
            input.value = nextValue
          }
        } else {
          event.preventDefault()

          input.value = 'A'
        }
      }
    } else if (event.key === 'ArrowLeft') {
      event.preventDefault()

      selectAndFocusInput(index - 1)
    } else if (event.key === 'ArrowRight') {
      event.preventDefault()

      selectAndFocusInput(index + 1)
    } else if (!isCabinet && new RegExp(input.pattern).test(event.key)) {
      event.preventDefault()

      // On the Arcade cabinet, the arcade buttons are mapped keyboard keys.
      // Regular keyboard keys should not change the input value on the cabinet.

      input.value = event.key.toUpperCase()

      if (inputs[index + 1]) {
        inputs[index + 1].disabled = false
      }

      selectAndFocusInput(index + 1)
    } else {
      return
    }

    update()
  }

  onMount(() => {
    inputs = [...inputList.querySelectorAll('input')]

    if (value) {
      for (const [index, input] of inputs.entries()) {
        if (value[index]) {
          input.value = value[index]
        }
      }
    }

    update()
  })
</script>

<ol class="flex gap-2" bind:this={inputList}>
  {#each { length: HIGHSCORE_NAME_LENGTH } as _, index}
    <li>
      <!-- svelte-ignore a11y_autofocus -->
      <input
        autofocus={index === 0}
        type="text"
        minlength="1"
        maxlength="1"
        pattern="^[a-zA-Z]$"
        class="text-black bg-white font-semibold caret-[transparent] select-all uppercase
          rounded-lg text-center p-2 focus:bg-green
          transition-all duration-200
          {value.length >= index ? '' : 'opacity-30'}
          text-5xl w-16 h-16
          sm:text-6xl sm:w-24 sm:h-24
          md:text-8xl md:w-32 md:h-32"
        onkeydown={(event) => handleKeydown(index, event)}
      />
    </li>
  {/each}
</ol>

<style scoped>
  input::selection {
    background-color: transparent;
  }

  input {
    outline-color: white;
  }
</style>
