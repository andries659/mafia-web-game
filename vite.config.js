import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    // Allows React Router to handle all routes in dev
    // (without this, refreshing /discord-callback gives a 404)
    historyApiFallback: true,
  },
})