// @ts-ignore
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

import { VitePWA } from 'vite-plugin-pwa'
import { VitePWAOptions } from 'vite-plugin-pwa'

const manifestForPlugin : Partial<VitePWAOptions> = {
  manifest: {
    name: 'CodeViewX',
    short_name: 'CodeViewX',
    description: 'CodeViewX is a source code viewer.',
    theme_color: '#ffffff',
    icons: [
      {
        src: '/icon192x192.png',
        sizes: '192x192',
        type: 'image/png',
      },
      {
        src: '/icon512x512.png',
        sizes: '512x512',
        type: 'image/png',
      },
      {
        src: '/icon512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable',
      },
    ],
  },
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), VitePWA(manifestForPlugin)],
})
