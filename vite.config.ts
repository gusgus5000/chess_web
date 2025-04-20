import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/tic_tac_toe_web/', // Correct base path for GitHub Pages
  build: {
    target: 'esnext',
  },
  // Removed optimizeDeps, resolve.alias, and server.headers as they are not needed
})
