const STARTUP_RETRY_MS = 500
const STARTUP_DURATION_MS = 15_000

// Svelte action: only the cabinet should request keyboard focus automatically.
export function cabinetFocus(container: HTMLElement, enabled: boolean) {
  if (!enabled) {
    return
  }

  const previousTabindex = container.getAttribute('tabindex')
  container.setAttribute('tabindex', '-1')

  let frameId = 0

  function recoverFocus() {
    if (document.hidden || !container.isConnected) {
      return
    }

    // Keep the map canvas or name input selected, even if Chrome's window lost
    // focus. Use the game container only when there is no focused game element.
    const active = document.activeElement
    const target = active instanceof HTMLElement && container.contains(active) ? active : container

    if (document.hasFocus() && active === target) {
      return
    }

    // This is a request to the browser, not a guarantee of macOS activation.
    if (!document.hasFocus()) {
      window.focus()
    }
    target.focus({ preventScroll: true })
  }

  function scheduleRecovery() {
    cancelAnimationFrame(frameId)
    // Let mounting/autofocus and visibility changes settle before choosing a target.
    frameId = requestAnimationFrame(recoverFocus)
  }

  scheduleRecovery()
  // Native kiosk/fullscreen transitions may finish after Svelte has mounted.
  const intervalId = window.setInterval(scheduleRecovery, STARTUP_RETRY_MS)
  const timeoutId = window.setTimeout(() => clearInterval(intervalId), STARTUP_DURATION_MS)

  window.addEventListener('focus', scheduleRecovery)
  window.addEventListener('pageshow', scheduleRecovery)
  document.addEventListener('visibilitychange', scheduleRecovery)
  document.addEventListener('fullscreenchange', scheduleRecovery)

  return {
    destroy() {
      clearInterval(intervalId)
      clearTimeout(timeoutId)
      cancelAnimationFrame(frameId)
      window.removeEventListener('focus', scheduleRecovery)
      window.removeEventListener('pageshow', scheduleRecovery)
      document.removeEventListener('visibilitychange', scheduleRecovery)
      document.removeEventListener('fullscreenchange', scheduleRecovery)
      if (previousTabindex === null) {
        container.removeAttribute('tabindex')
      } else {
        container.setAttribute('tabindex', previousTabindex)
      }
    }
  }
}
