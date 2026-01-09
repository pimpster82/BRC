import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      strategies: 'generateSW',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
        cleanupOutdatedCaches: true
      },
      // Note: Custom sw.js logic will be handled by service worker listeners
      // Manifest injection removed - using generateSW strategy instead
    })
  ],
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
