import adapter from '@sveltejs/adapter-static'
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  preprocess: vitePreprocess({
    postcss: true
  }),
  kit: {
    adapter: adapter({
      pages: 'build',
      assets: 'build',
      fallback: undefined,
      precompress: false,
      strict: true
    }),
    env: {
      publicPrefix: 'ARCADE_'
    },
    alias: {
      $lib: './src/lib',
      '$lib/*': './src/lib/*'
    }
  }
}

export default config
