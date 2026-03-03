import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': {
        target: 'http://186.64.122.100',
        changeOrigin: true,
      },
      '/uploads': {
        target: 'http://186.64.122.100',
        changeOrigin: true,
      },
    },
  },
})
