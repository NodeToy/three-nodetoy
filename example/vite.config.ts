import { defineConfig } from 'vite'
import reactRefresh from '@vitejs/plugin-react-refresh'

export default defineConfig({
  server: {
    port: 3001,
  },
  optimizeDeps: {
    exclude: ['@react-three/fiber'],
  },
  plugins: [reactRefresh()],
})
