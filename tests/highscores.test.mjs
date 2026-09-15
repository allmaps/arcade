import assert from 'node:assert/strict'
import { after, test } from 'node:test'
import { fileURLToPath } from 'node:url'
import { createServer } from 'vite'

// Use Vite's existing TypeScript/alias support without adding a test dependency.
const server = await createServer({
  configFile: false,
  resolve: { alias: { $lib: fileURLToPath(new URL('../src/lib', import.meta.url)) } },
  server: { middlewareMode: true, watch: null },
  appType: 'custom'
})
after(() => server.close())
const { isHighscore } = await server.ssrLoadModule('/src/lib/shared/score.ts')
const { default: CabinetEnvironment } = await server.ssrLoadModule(
  '/src/lib/shared/environments/cabinet.ts'
)

function highscore(score, id = String(score)) {
  return { id, name: 'TEST', score, date: new Date('2026-01-01T00:00:00Z') }
}

const history = [10, 500, 100, 1000, 400, 200, 800, 300, 900, 600, 700].map((score) =>
  highscore(score)
)

test('qualification uses the top ten, not lower scores retained in history', () => {
  const original = [...history]
  assert.equal(isHighscore(history, 50), false)
  assert.equal(isHighscore(history, 100), false, 'tying tenth place does not displace it')
  assert.equal(isHighscore(history, 101), true)
  assert.equal(isHighscore(history, 1100), true)
  assert.deepEqual(history, original, 'checking a score must not reorder stored history')
})

test('a full leaderboard requires beating its tenth-place score', () => {
  const topTen = history.filter(({ score }) => score >= 100)
  assert.equal(isHighscore(topTen, 99), false)
  assert.equal(isHighscore(topTen, 100), false)
  assert.equal(isHighscore(topTen, 101), true)
})

test('positive scores fill empty leaderboard slots; zero scores do not', () => {
  assert.equal(isHighscore([], 1), true)
  assert.equal(isHighscore(history.slice(0, 9), 1), true)
  assert.equal(isHighscore([], 0), false)
  assert.equal(isHighscore([], 0.5), false)
})

test('cabinet storage preserves history and subsequent games use the updated cutoff', async () => {
  const previousStorage = Object.getOwnPropertyDescriptor(globalThis, 'localStorage')
  const data = new Map([['highscores', JSON.stringify(history)]])
  Object.defineProperty(globalThis, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key) => data.get(key) ?? null,
      setItem: (key, value) => data.set(key, String(value))
    }
  })

  try {
    const cabinet = new CabinetEnvironment()
    const loaded = await cabinet.getHighscores()
    assert.equal(loaded.length, history.length)
    assert.ok(loaded[0].date instanceof Date)
    assert.equal(isHighscore(loaded, 50), false)
    await cabinet.saveHighscore(highscore(1100))

    // A fresh environment represents another game/reload reading localStorage.
    const reloaded = await new CabinetEnvironment().getHighscores()
    assert.equal(reloaded.length, history.length + 1, 'retain existing score history')
    assert.equal(reloaded[0].score, 1100)
    assert.equal(isHighscore(reloaded, 150), false, 'tenth place is now 200')
    assert.equal(isHighscore(reloaded, 200), false)
    assert.equal(isHighscore(reloaded, 201), true)
  } finally {
    if (previousStorage) {
      Object.defineProperty(globalThis, 'localStorage', previousStorage)
    } else {
      delete globalThis.localStorage
    }
  }
})
