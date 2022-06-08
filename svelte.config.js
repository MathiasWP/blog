import { mdsvex } from 'mdsvex'
import mdsvexConfig from './mdsvex.config.js'
import preprocess from 'svelte-preprocess'
import adapter from '@sveltejs/adapter-vercel'

/** @type {import('@sveltejs/kit').Config} */
const config = {
  extensions: ['.svelte', ...mdsvexConfig.extensions],
  preprocess: [
    mdsvex(mdsvexConfig),
    [
      preprocess({
        postcss: true
      })
    ]
  ],
  kit: {
    adapter: adapter(),
    // todo: change to static adapter?
    prerender: {
      default: true
    },
    vite: {
      // allows vite access to ./posts
      server: {
        fs: {
          allow: ['./']
        }
      }
    }
  }
}

export default config
