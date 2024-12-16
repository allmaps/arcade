import { theme } from '@allmaps/tailwind'

import typography from '@tailwindcss/typography'
import containerQueries from '@tailwindcss/container-queries'

import type { Config } from 'tailwindcss'

export default {
  mode: 'jit',
  content: [
    './src/**/*.{html,js,svelte,ts}',
    './node_modules/@allmaps/ui/dist/components/**/*.{html,js,svelte,ts}'
  ],
  theme: {
    ...theme,
    extend: {
      screens: {
        hsm: { raw: '(min-height: 640px)' },
        hmd: { raw: '(min-height: 768px)' },
        hlg: { raw: '(min-height: 1024px)' },
        hxl: { raw: '(min-height: 1280px)' },
        h2xl: { raw: '(min-height: 1536px)' },

        whsm: { raw: '((min-height: 640px) and (min-width: 640px))' },
        whmd: { raw: '((min-height: 768px) and (min-width: 768px))' },
        whlg: { raw: '((min-height: 1024px) and (min-width: 1024px))' },
        whxl: { raw: '((min-height: 1280px) and (min-width: 1280px))' },
        wh2xl: { raw: '((min-height: 1536px) and (min-width: 1536px))' }
      }
    }
  },
  plugins: [typography, containerQueries]
} satisfies Config
