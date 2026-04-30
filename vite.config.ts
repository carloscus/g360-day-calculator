import { defineConfig } from 'vite'
import { svelte } from '@sveltejs/vite-plugin-svelte'

export default defineConfig({
  plugins: [svelte()],
  base: './',
  build: {
    outDir: 'dist',
    assetsDir: 'g360-assets',
    sourcemap: false,
  },
  server: {
    port: 3000,
    open: true,
    host: 'localhost',
    hmr: {
      protocol: 'ws',
      host: 'localhost'
    },
  },
})