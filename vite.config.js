import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'https://186.64.122.100',
        changeOrigin: true,
        secure: false,
        headers: { Host: 'makuk.cl' },
      },
      '/uploads': {
        target: 'https://186.64.122.100',
        changeOrigin: true,
        secure: false,
        headers: { Host: 'makuk.cl' },
      },
    },
  },
})
