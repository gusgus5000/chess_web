import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/chess_web/',  // Add this line for GitHub Pages
  optimizeDeps: {
    exclude: ['stockfish']
  },
  build: {
    target: 'esnext',
  },
  resolve: {
    alias: {
      'stockfish': 'stockfish/stockfish.js'
    }
  },
  server: {
    headers: {
      'Cross-Origin-Opener-Policy': 'same-origin',
      'Cross-Origin-Embedder-Policy': 'require-corp'
    }
  }
})
