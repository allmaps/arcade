import assert from 'node:assert/strict'
import { test } from 'node:test'

import { getArea, getDistance } from '../src/lib/shared/geodesy.ts'

function assertClose(actual, expected) {
  assert.ok(Math.abs(actual - expected) <= Math.max(1, expected) * 1e-9)
}

// Reference values from Arcade's previous OpenLayers implementation, including
// its EPSG:4326 -> EPSG:3857 -> spherical-area conversion.
const areaCases = [
  { west: 0, south: 0, area: 12363718145.179935 },
  { west: 4, south: 52, area: 7526841324.975262 },
  { west: -70, south: -40, area: 9540512136.366169 }
]

for (const { west, south, area } of areaCases) {
  test(`preserves area and winding independence near ${west}, ${south}`, () => {
    const ring = [
      [west, south],
      [west + 1, south],
      [west + 1, south + 1],
      [west, south + 1],
      [west, south]
    ]
    assertClose(getArea({ type: 'Polygon', coordinates: [ring] }), area)
    assertClose(getArea({ type: 'Polygon', coordinates: [ring.toReversed()] }), area)
  })
}

test('subtracts polygon holes', () => {
  const outer = [
    [0, 0],
    [2, 0],
    [2, 2],
    [0, 2],
    [0, 0]
  ]
  const inner = [
    [0.5, 0.5],
    [1, 0.5],
    [1, 1],
    [0.5, 1],
    [0.5, 0.5]
  ]
  assertClose(
    getArea({ type: 'Polygon', coordinates: [outer, inner] }),
    getArea({ type: 'Polygon', coordinates: [outer] }) -
      getArea({ type: 'Polygon', coordinates: [inner] })
  )
})

test('keeps scoring distances in meters', () => {
  assertClose(getDistance([4.9, 52.37], [4.48, 51.92]), 57663.776823431304)
  assert.equal(getDistance([4.9, 52.37], [4.9, 52.37]), 0)
})

test('takes the short route across the antimeridian', () => {
  assertClose(getDistance([179, 0], [-179, 0]), 222390.16046706488)
})
