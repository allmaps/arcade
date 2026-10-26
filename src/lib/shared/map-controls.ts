import type { Map } from 'maplibre-gl'

export const PAN_STEP = 150
const ANIMATION_DURATION = 300

export function createMapControls(map: Map, panStep = PAN_STEP) {
  const canvas = map.getCanvas()
  const pendingCallbacks = new Set<ReturnType<typeof setTimeout>>()
  let zoomFraction = 0
  let enabled = true
  let disposed = false

  // Handle keyboard and button input through the same public camera methods.
  map.keyboard.disable()

  function move(x: number, y: number, zoomDirection: number, originalEvent?: KeyboardEvent) {
    if (!enabled || disposed) return

    canvas.focus({ preventScroll: true })
    const currentZoom = map.getZoom()
    const zoom = zoomDirection
      ? Math.round(currentZoom - zoomFraction + zoomDirection) + zoomFraction
      : currentZoom

    map.easeTo(
      {
        duration: ANIMATION_DURATION,
        easeId: 'arcade-controls',
        easing: (t) => t * (2 - t),
        center: map.getCenter(),
        zoom: Math.max(map.getMinZoom(), Math.min(map.getMaxZoom(), zoom)),
        bearing: map.getBearing(),
        pitch: 0,
        offset: [-x * panStep, -y * panStep]
      },
      { arcadeInteraction: true, originalEvent }
    )
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.altKey || event.ctrlKey || event.metaKey || !enabled || disposed) return

    switch (event.key) {
      case '+':
      case '=':
        move(0, 0, 1, event)
        break
      case '-':
        move(0, 0, -1, event)
        break
      case 'ArrowLeft':
        move(-1, 0, 0, event)
        break
      case 'ArrowRight':
        move(1, 0, 0, event)
        break
      case 'ArrowUp':
        move(0, -1, 0, event)
        break
      case 'ArrowDown':
        move(0, 1, 0, event)
        break
      default:
        return
    }
    event.preventDefault()
  }

  function setInteractionEnabled(value: boolean) {
    enabled = value
    const method = value ? 'enable' : 'disable'
    map.scrollZoom[method]()
    map.boxZoom[method]()
    map.dragPan[method]()
    map.doubleClickZoom[method]()
    map.touchZoomRotate[method]()
    map.touchZoomRotate.disableRotation()
  }

  canvas.addEventListener('keydown', handleKeydown)

  function cancelCallbacks() {
    for (const timeout of pendingCallbacks) clearTimeout(timeout)
    pendingCallbacks.clear()
  }

  return {
    zoomIn: () => move(0, 0, 1),
    zoomOut: () => move(0, 0, -1),
    pan: (x: number, y: number) => move(x, y, 0),
    focus: () => canvas.focus({ preventScroll: true }),
    setZoomFraction: (fraction: number) => {
      zoomFraction = fraction
    },
    enable: () => {
      if (!disposed) {
        cancelCallbacks()
        setInteractionEnabled(true)
      }
    },
    disable: (callback?: () => void) => {
      if (disposed) return
      setInteractionEnabled(false)
      map.stop()
      if (callback) {
        const timeout = setTimeout(() => {
          pendingCallbacks.delete(timeout)
          if (!disposed && !enabled) callback()
        }, ANIMATION_DURATION)
        pendingCallbacks.add(timeout)
      }
    },
    destroy: () => {
      disposed = true
      canvas.removeEventListener('keydown', handleKeydown)
      cancelCallbacks()
    }
  }
}

export type MapControls = ReturnType<typeof createMapControls>
