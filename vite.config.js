import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig({
  plugins: [vue()],
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
