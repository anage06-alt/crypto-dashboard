import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/coingecko': {
        target: 'https://api.coingecko.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/coingecko/, ''),
      },
      '/cointelegraph-rss': {
        target: 'https://cointelegraph.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/cointelegraph-rss/, ''),
      },
    },
  },
})
