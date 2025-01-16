import { writable } from 'svelte/store'
import { browser } from '$app/environment'

import { isCabinet } from '$lib/shared/cabinet.js'

import DefaultEnvironment from '$lib/shared/environments/default.js'

import type { ArcadeEnvironment } from '$lib/shared/types.js'

export const environment = writable<ArcadeEnvironment>(new DefaultEnvironment())

// pnpm run build fails when ssr = true (or, at least, not ssr = false) in +layout.ts
// when running HighscoreSchema.array().parse(highscores) in cabinet.ts
// on a server-rendered page during build.
// Use DefaultEnvironment to solve this.
// TODO: find out why and fix this properly!

if (browser) {
  if (isCabinet) {
    const module = await import('$lib/shared/environments/cabinet.js')
    environment.set(new module.default())
  } else {
    const module = await import('$lib/shared/environments/web.js')
    environment.set(new module.default())
  }
}
