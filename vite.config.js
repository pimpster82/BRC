import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  base: '/', // Vercel deploys to root. For GitHub Pages, change to '/BRC/'
  server: {
    port: 3000,
    hmr: {
      protocol: 'ws',
      host: 'localhost',
      port: 3000
    },
    headers: {
      'Cache-Control': 'no-store',
    }
  },
  preview: {
    headers: {
      'Cache-Control': 'no-store',
    }
  }
})
