import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    proxy: {
      '/api/sui': {
        target: 'https://fullnode.testnet.sui.io',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/sui/, ''),
        secure: true,
      },
    },
  },
})
