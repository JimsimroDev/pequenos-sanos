import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  base: mode === 'production' ? '/pequenos-sanos/' : '/',
  server: {
    port: 3000,
  },
  define: {
    // sockjs-client uses Node's `global` — polyfill it for the browser
    global: 'globalThis',
  },
}))
