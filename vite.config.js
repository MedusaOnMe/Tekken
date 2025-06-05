import { defineConfig } from 'vite'

export default defineConfig({
  base: './',
  server: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: 'all'
  },
  preview: {
    host: '0.0.0.0',
    port: 3000,
    allowedHosts: [
      '3adb6593-930d-4628-b86e-d0e5b32dd8ca-00-1hlpyfamqto0x.kirk.replit.dev',
      'tekken-medusaon.replit.app',
      'billfighter.fun'
    ]
  },
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: './index.html'
      }
    }
  }
})