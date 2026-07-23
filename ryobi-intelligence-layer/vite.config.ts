import { defineConfig } from 'vite'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

const dir = path.dirname(fileURLToPath(import.meta.url))

// Relative base so the built bundle works identically at a domain root,
// at a GitHub Pages project sub-path (/<repo>/), and from the local filesystem.
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': path.resolve(dir, './src') },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    target: 'es2020',
    chunkSizeWarningLimit: 900,
  },
})
