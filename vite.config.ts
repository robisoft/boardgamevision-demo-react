import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/demo-react/',
  plugins: [react()],
  envPrefix: ['VITE_', 'BGV_'],
  server: {
    proxy: {
      '/gameHub': {
        target: 'http://localhost:5000',
        ws: true,
        changeOrigin: true,
      },
    },
  },
})
