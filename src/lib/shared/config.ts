import { merge } from 'lodash-es'
import { parse } from 'yaml'

import defaultConfig from '$lib/shared/default-config.js'
import { ConfigurationSchema } from '$lib/shared/schemas.js'

import type { Configuration } from '$lib/shared/types.js'

export const yamlConfigUrl = import.meta.env.ARCADE_YAML_CONFIG_URL

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P]
}

async function fetchConfiguration(yamlConfigUrl: string): Promise<DeepPartial<Configuration>> {
  const yamlConfig = await fetch(yamlConfigUrl).then((response) => response.text())
  return ConfigurationSchema.deepPartial().parse(parse(yamlConfig))
}

export async function getConfiguration(): Promise<Configuration> {
  if (yamlConfigUrl) {
    try {
      const config = await fetchConfiguration(yamlConfigUrl)
      return merge(defaultConfig, config)
    } catch (err) {
      console.error('Error fetching YAML configuration file, using default configuration', err)
    }
  }

  return defaultConfig
}
