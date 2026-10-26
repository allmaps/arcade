import { createZoomInEvent, createZoomOutEvent } from '$lib/shared/maplibre.js'

import type { KeyboardTarget } from '$lib/shared/types.js'

export function zoomIn(target?: KeyboardTarget) {
  if (!target) {
    return
  }
  target.element.dispatchEvent(createZoomInEvent())
}

export function zoomOut(target?: KeyboardTarget) {
  if (!target) {
    return
  }

  target.element.dispatchEvent(createZoomOutEvent())
}
