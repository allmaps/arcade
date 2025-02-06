import { initializeEnvironment } from '$lib/shared/environment.js'
import { getConfiguration } from '$lib/shared/config.js'

import type { LayoutData } from '$lib/shared/types.js'

export const prerender = true

export async function load(): Promise<LayoutData> {
  // TODO: load from environment var.
  const isCabinet = false

  const environment = await initializeEnvironment(isCabinet)
  const configuration = await getConfiguration()

  return {
    environment,
    configuration
  }
}
