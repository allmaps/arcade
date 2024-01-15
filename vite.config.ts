import { sveltekit } from '@sveltejs/kit/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [sveltekit()],
  envPrefix: 'ARCADE_',
  build: {
    target: 'esnext'
  },
  assetsInclude: ['**/*.lottie']
})
