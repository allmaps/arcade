import { defineConfig, type UserConfig } from 'vite'

import { sveltekit } from '@sveltejs/kit/vite'

export default defineConfig({
  plugins: [sveltekit()],
  envPrefix: 'ARCADE_',
  build: {
    target: 'esnext'
  },
  ssr: {
    noExternal: ['maplibre-gl', 'maplibre-contour']
  }
}) satisfies UserConfig
