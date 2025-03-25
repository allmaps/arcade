import { initializeEnvironment } from '$lib/shared/environment.js'
import { getConfiguration } from '$lib/shared/config.js'
import { isCabinet } from '$lib/shared/cabinet.js'

import type { LayoutData } from '$lib/shared/types.js'

export const prerender = true

export async function load(): Promise<LayoutData> {
  const environment = await initializeEnvironment(isCabinet)
  const configuration = await getConfiguration()

  return {
    environment,
    configuration
  }
}
