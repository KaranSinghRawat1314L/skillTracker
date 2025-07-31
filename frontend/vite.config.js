import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [tailwindcss(), react()],
  server: {
    proxy: {
      '/api': 'https://skilltracker-tij0.onrender.com',
      '/profile_pics': 'https://skilltracker-tij0.onrender.com'
    }
  }
})
