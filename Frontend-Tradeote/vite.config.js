import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    host: true,
    port: 5173,
    strictPort: true,
    cors: true,
    allowedHosts: [
      'localhost',
      '127.0.0.1',
      '.ngrok.io',
      '.ngrok-free.dev'
    ],
    proxy: {
      '/api': {
        target: 'https://localhost:7028',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})