import type { ArcadeEnvironment } from '$lib/shared/types.js'

export async function initializeEnvironment(isCabinet: boolean) {
  let environment: ArcadeEnvironment

  if (isCabinet) {
    const module = await import('$lib/shared/environments/cabinet.js')
    environment = new module.default()
  } else {
    const module = await import('$lib/shared/environments/web.js')
    environment = new module.default()
  }

  return environment
}
