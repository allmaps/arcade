import { writable } from 'svelte/store'

import { isCabinet } from '$lib/shared/cabinet.js'
import type { ArcadeEnvironment } from '$lib/shared/types.js'

export const environment = writable<ArcadeEnvironment>()

if (isCabinet) {
  const module = await import('$lib/shared/environments/cabinet.js')
  environment.set(new module.default())
} else {
  const module = await import('$lib/shared/environments/web.js')
  environment.set(new module.default())
}
