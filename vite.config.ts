import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  base: './',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.svg'],
      workbox: {
        // Precache the embedded standalone pages too.
        globPatterns: ['**/*.{js,css,html,svg,png,ico,woff,woff2,ttf}'],
        // The app uses hash routing, so the SPA navigation fallback must NOT
        // hijack requests for the embedded standalone .html pages (otherwise the
        // service worker serves index.html — the whole app — inside the iframe).
        navigateFallback: 'index.html',
        navigateFallbackDenylist: [/\.html$/],
      },
      manifest: {
        name: 'LabVivid - Interactive Science Lab',
        short_name: 'LabVivid',
        description: 'Interactive science simulations for physics, chemistry, and mathematics.',
        theme_color: '#0b1020',
        background_color: '#0b1020',
        display: 'standalone',
        start_url: './',
        icons: [
          { src: 'icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png' },
          { src: 'icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    })
  ]
});
