import assert from 'node:assert/strict'
import { test } from 'node:test'

import { createMapControls, PAN_STEP } from '../src/lib/shared/map-controls.ts'

function setup({ zoom = 8.25, minZoom = 1.25, maxZoom = 12.25 } = {}) {
  const canvas = new EventTarget()
  canvas.focus = () => {}
  const moves = []
  const handlers = Object.fromEntries(
    ['keyboard', 'scrollZoom', 'boxZoom', 'dragPan', 'doubleClickZoom', 'touchZoomRotate'].map(
      (name) => [
        name,
        {
          enabled: true,
          rotation: true,
          enable() {
            this.enabled = true
          },
          disable() {
            this.enabled = false
          },
          disableRotation() {
            this.rotation = false
          }
        }
      ]
    )
  )
  const map = {
    ...handlers,
    getCanvas: () => canvas,
    getZoom: () => zoom,
    getMinZoom: () => minZoom,
    getMaxZoom: () => maxZoom,
    getCenter: () => [4.9, 52.37],
    getBearing: () => 37,
    stop() {},
    easeTo(options, eventData) {
      moves.push({ ...options, eventData })
      zoom = options.zoom
    }
  }
  const controls = createMapControls(map)
  controls.setZoomFraction(0.25)
  function key(key, modifiers = {}) {
    const event = new Event('keydown', { cancelable: true })
    Object.assign(event, { key, ...modifiers })
    canvas.dispatchEvent(event)
    return event
  }
  return { controls, moves, handlers, key }
}

test('button and keyboard zoom preserve the scoring zoom fraction and respect limits', () => {
  const { controls, moves, key } = setup({ zoom: 11.25 })
  controls.zoomIn()
  controls.zoomIn()
  key('-')
  assert.deepEqual(
    moves.map((move) => move.zoom),
    [12.25, 12.25, 11.25]
  )
  const minimum = setup({ zoom: 1.25 })
  minimum.controls.zoomOut()
  assert.equal(minimum.moves[0].zoom, 1.25)
})

test('panning keeps the image bearing and zoom, using screen directions', () => {
  const { controls, moves, key } = setup()
  const event = key('ArrowRight')
  assert.equal(event.defaultPrevented, true)
  assert.deepEqual(moves[0].offset, [-PAN_STEP, -0])
  assert.equal(moves[0].zoom, 8.25)
  assert.equal(moves[0].bearing, 37)
  assert.equal(moves[0].eventData.originalEvent, event)
  controls.pan(0, -1)
  assert.deepEqual(moves[1].offset, [-0, PAN_STEP])
  assert.equal(moves[1].eventData.arcadeInteraction, true)
})

test('ignores browser shortcuts and unrelated keys', () => {
  const { key, moves } = setup()
  assert.equal(key('+', { metaKey: true }).defaultPrevented, false)
  assert.equal(key('-', { ctrlKey: true }).defaultPrevented, false)
  assert.equal(key('ArrowLeft', { altKey: true }).defaultPrevented, false)
  assert.equal(key('Enter').defaultPrevented, false)
  assert.equal(moves.length, 0)
})

test('submission lock blocks buttons, keyboard and gestures, then restores interaction without rotation', () => {
  const { controls, moves, handlers, key } = setup()
  controls.disable()
  controls.zoomIn()
  controls.pan(1, 0)
  key('ArrowRight')
  assert.equal(moves.length, 0)
  assert.ok(Object.values(handlers).every((handler) => !handler.enabled))
  controls.enable()
  controls.zoomIn()
  key('ArrowRight')
  assert.equal(moves.length, 2)
  assert.equal(handlers.keyboard.enabled, false)
  assert.equal(handlers.touchZoomRotate.enabled, true)
  assert.equal(handlers.touchZoomRotate.rotation, false)
})

test('destroy removes keyboard input and cancels pending submission callbacks', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const { controls, moves, key } = setup()
  let callbacks = 0
  controls.disable(() => callbacks++)
  controls.destroy()
  controls.enable()
  controls.zoomIn()
  assert.equal(key('ArrowRight').defaultPrevented, false)
  t.mock.timers.tick(1000)
  assert.equal(callbacks, 0)
  assert.equal(moves.length, 0)
})

test('submission callback runs after input is stopped and stays cancelled if interaction resumes', (t) => {
  t.mock.timers.enable({ apis: ['setTimeout'] })
  const { controls } = setup()
  let callbacks = 0
  controls.disable(() => callbacks++)
  t.mock.timers.tick(299)
  assert.equal(callbacks, 0)
  t.mock.timers.tick(1)
  assert.equal(callbacks, 1)
  controls.disable(() => callbacks++)
  controls.enable()
  controls.disable()
  t.mock.timers.tick(300)
  assert.equal(callbacks, 1)
})
