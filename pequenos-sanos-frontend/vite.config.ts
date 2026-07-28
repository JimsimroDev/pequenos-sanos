import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/pequenos-sanos-frontend/',   // relative base — works on any GitHub Pages subpath
  server: {
    port: 3000,
  },
  define: {
    // sockjs-client uses Node's `global` — polyfill it for the browser
    global: 'globalThis',
  },
})
