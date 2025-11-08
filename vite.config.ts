import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  root: './src/renderer',
  server: {
    middlewareMode: false,
    port: 5173
  },
  build: {
    outDir: '../../dist',
    emptyOutDir: false,
    lib: false,
    minify: 'terser',
    sourcemap: false
  }
})
