<script lang="ts">
  import { onMount, createEventDispatcher } from 'svelte'
  import { Tooltip } from 'bits-ui'

  import ArcadeButtonIcon from '$lib/components/ArcadeButtonIcon.svelte'

  import { flyAndScale } from '$lib/shared/transitions.js'
  import { isTouchDevice } from '$lib/shared/stores/touch.js'

  import type { Button } from '$lib/shared/types.js'

  const dispatch = createEventDispatcher()

  export let button: Button
  export let verb: string
  export let timeout = 0
  export let disabled = false

  let toggled = false

  let timeoutId: number

  let element: HTMLButtonElement

  $: bgClass = disabled ? 'bg-gray' : button.bgClass || 'bg-green'
  const textClass = button.textClass || 'text-white'
  const type = button.type || 'secondary'
  const icon = button.icon || false

  let typeClasses =
    type === 'primary' ? 'px-6 py-3 lg:px-9 lg:py-5 text-lg' : 'px-4 py-2 lg:px-6 lg:py-3 text-base'

  if (icon) {
    typeClasses = 'w-[2.9rem] h-[2.9rem] p-[0.7rem]'
  }

  function toggleStart() {
    toggled = true
    dispatch('toggleStart')
  }

  function toggleEnd() {
    toggled = false
    dispatch('toggleEnd')
  }

  function handleKeypress(event: KeyboardEvent) {
    if (event.code === button.keyCode && !event.repeat && !disabled) {
      dispatch('click')
    }
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.code === button.keyCode && !event.repeat && !disabled) {
      toggled = true
      dispatch('toggleStart')
    }
  }

  function handleKeyup(event: KeyboardEvent) {
    if (event.code === button.keyCode && !event.repeat && !disabled) {
      toggled = false
      dispatch('toggleEnd')

      // element.dispatchEvent(new Event('mouseup'))
      // touch ? dispatch('touchend') : dispatch('mouseup')
    }
  }

  function handleMousedown() {
    if (!$isTouchDevice) {
      toggleStart()
    }
  }

  function handleMouseup() {
    if (!$isTouchDevice) {
      toggleEnd()
    }
  }

  function handleClick() {
    if ($isTouchDevice) {
      if (!toggled) {
        toggleStart()
      } else {
        toggleEnd()
      }
    }

    dispatch('click')
  }

  onMount(() => {
    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        element.dispatchEvent(new Event('click'))
      }, timeout)
    }

    return () => clearTimeout(timeoutId)
  })
</script>

<svelte:document on:keypress={handleKeypress} on:keydown={handleKeydown} on:keyup={handleKeyup} />

<Tooltip.Root openDelay={2000}>
  <Tooltip.Trigger asChild let:builder>
    <button
      use:builder.action
      {...builder}
      bind:this={element}
      type="button"
      on:mousedown={handleMousedown}
      on:mouseup={handleMouseup}
      on:click={handleClick}
      class:toggled
      {disabled}
      class="{bgClass} {typeClasses} group relative transition-all duration-75 top-0 shadow-md font-medium rounded-full pointer-events-auto overflow-hidden focus:outline-none"
    >
      <div class="absolute w-full h-full top-0 left-0 bg-white/20"></div>
      <div
        style="animation-duration: {timeout}ms;"
        class="timeout absolute w-full h-full top-0 left-0 transition-all group-active:bg-white/20 {toggled
          ? 'bg-none'
          : bgClass}"
      />
      <div class="relative {textClass} w-full h-full"><slot /></div></button
    >
  </Tooltip.Trigger>
  <Tooltip.Content
    class="z-[999]"
    transition={flyAndScale}
    transitionConfig={{ y: 8, duration: 150 }}
    sideOffset={8}
  >
    <div class="bg-white">
      <Tooltip.Arrow class="rounded-[2px]" />
    </div>
    <div
      class="flex items-center justify-center rounded-lg bg-white px-4 py-3 text-black text-sm shadow-lg outline-none"
    >
      Press <span class="mx-1"><ArcadeButtonIcon {button} /></span> to {verb}
    </div>
  </Tooltip.Content>
</Tooltip.Root>

<style scoped lang="postcss">
  .active,
  button:active {
    @apply shadow-sm top-[1px];
  }
</style>
