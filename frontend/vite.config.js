import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/predict': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/simulate': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/analyze_goal': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/generate_report': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/health': {
        target: 'http://localhost:8000',
        changeOrigin: true
      },
      '/analyze_eda': {
        target: 'http://localhost:8000',
        changeOrigin: true
      }
    }
  }
})
