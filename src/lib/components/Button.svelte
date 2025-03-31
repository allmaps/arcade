<script lang="ts">
  import { onMount } from 'svelte'
  import { Tooltip } from 'bits-ui'

  import ArcadeButtonIcon from '$lib/components/ArcadeButtonIcon.svelte'

  import { flyAndScale } from '$lib/shared/transitions.js'

  import { getDeviceState } from '$lib/shared/stores/device.svelte.js'

  import type { Snippet } from 'svelte'

  import type { Button } from '$lib/shared/types.js'

  type Props = {
    button: Button
    verb: string
    timeout?: number
    disabled?: boolean
    onclick?: () => void
    ontogglestart?: () => void
    ontoggleend?: () => void
    children?: Snippet
  }

  let {
    button,
    verb,
    timeout = 0,
    disabled = false,
    onclick,
    ontogglestart,
    ontoggleend,
    children
  }: Props = $props()

  const deviceState = getDeviceState()

  let toggled = $state(false)

  let timeoutId: number

  let element: HTMLButtonElement

  let bgClass = $derived(disabled ? 'bg-gray' : button.bgClass || 'bg-green')
  const textClass = button.textClass || 'text-white'
  const type = button.type || 'secondary'
  const icon = button.icon || false

  let typeClasses = $state(
    type === 'primary' ? 'px-6 py-3 lg:px-9 lg:py-5 text-lg' : 'px-4 py-2 lg:px-6 lg:py-3 text-base'
  )

  if (icon) {
    typeClasses = 'w-[2.9rem] h-[2.9rem] p-[0.7rem]'
  }

  function handleToggleStart() {
    toggled = true
    ontogglestart?.()
  }

  function handleToggleEnd() {
    toggled = false
    ontoggleend?.()
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.code === button.keyCode && !event.repeat && !disabled) {
      handleToggleStart()
    }
  }

  function handleKeyup(event: KeyboardEvent) {
    if (event.code === button.keyCode && !event.repeat && !disabled) {
      handleToggleEnd()
      onclick?.()
      // element.dispatchEvent(new Event('mouseup'))
      // touch ? dispatch('touchend') : dispatch('mouseup')
    }
  }

  function handleMousedown() {
    if (!deviceState.isTouch) {
      handleToggleStart()
    }
  }

  function handleMouseup() {
    if (!deviceState.isTouch) {
      handleToggleEnd()
    }
  }

  function handleClick() {
    if (deviceState.isTouch) {
      if (!toggled) {
        handleToggleStart()
      } else {
        handleToggleEnd()
      }
    }

    onclick?.()
  }

  onMount(() => {
    if (timeout > 0) {
      timeoutId = setTimeout(() => {
        onclick?.()
      }, timeout)
    }

    return () => clearTimeout(timeoutId)
  })
</script>

<svelte:document onkeydown={handleKeydown} onkeyup={handleKeyup} />

<Tooltip.Provider>
  <Tooltip.Root delayDuration={2000}>
    <Tooltip.Trigger
      class="inline-flex size-10 items-center justify-center rounded-full
		border border-border-input focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-dark focus-visible:ring-offset-2 focus-visible:ring-offset-background"
    >
      {#snippet child({ props })}
        <button
          {...props}
          bind:this={element}
          type="button"
          onmousedown={handleMousedown}
          onmouseup={handleMouseup}
          onclick={handleClick}
          data-active={toggled || undefined}
          {disabled}
          class="{bgClass} {typeClasses}
            cursor-pointer group relative transition-all
            duration-75 top-0 shadow-md font-medium rounded-full
            pointer-events-auto overflow-hidden focus:outline-hidden
            active:top-[1px] active:shadow-sm
            data-active:top-[1px] data-active:shadow-sm"
        >
          <div class="absolute w-full h-full top-0 left-0 bg-white/20"></div>
          <div
            style="animation-duration: {timeout}ms;"
            class="timeout absolute w-full h-full top-0 left-0 transition-all
            group-active:bg-white/20 hover:bg-white/5
            {toggled ? 'bg-none' : bgClass}"
          ></div>
          <div class="relative {textClass} w-full h-full pointer-events-none">
            {@render children?.()}
          </div></button
        >
      {/snippet}
    </Tooltip.Trigger>
    <Tooltip.Portal>
      <Tooltip.Content sideOffset={8} side="top" forceMount>
        {#snippet child({ wrapperProps, props, open })}
          {#if open}
            <div {...wrapperProps}>
              <div {...props} transition:flyAndScale={{ y: 8, duration: 150 }} class="text-white">
                <Tooltip.Arrow />
                <div
                  class="flex items-center justify-center rounded-lg bg-white px-4 py-3 text-black text-sm shadow-lg outline-hidden"
                >
                  Press <span class="mx-1"><ArcadeButtonIcon {button} /></span> to {verb}
                </div>
              </div>
            </div>
          {/if}
        {/snippet}
      </Tooltip.Content>
    </Tooltip.Portal>
  </Tooltip.Root>
</Tooltip.Provider>
