import { defineConfig } from 'vitepress'

const baseIndex = process.argv.indexOf('--base')

const base = (baseIndex !== -1 && process.argv[baseIndex + 1]) || '/'

export default defineConfig({
  base,
  head: [
    [
      'link',
      {
        rel: 'icon',
        href: base + 'logo.jpg',
      },
    ],
  ],
  themeConfig: {
    logo: 'logo.jpg',
  },
})
