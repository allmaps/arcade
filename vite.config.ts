import { defineConfig, type UserConfig } from 'vite'

import { sveltekit } from '@sveltejs/kit/vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [tailwindcss(), sveltekit()],
  envPrefix: 'ARCADE_',
  build: {
    target: 'esnext'
  },
  ssr: {
    noExternal: ['maplibre-gl', 'maplibre-contour']
  }
}) satisfies UserConfig
