import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
  base: './',
  server: {
    port: 3000,
    open: true,
    host: 'localhost',
    hmr: {
      protocol: 'ws',
      host: 'localhost'
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})